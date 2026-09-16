package com.cyberas.domain.service;

import com.cyberas.api.dto.AuditDtos;
import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.AuditRiskAssessment;
import com.cyberas.domain.entity.EvaluationParticipant;
import com.cyberas.domain.entity.EvaluationProject;
import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.entity.Invitation;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.Question;
import com.cyberas.domain.entity.QuestionAnswer;
import com.cyberas.domain.entity.Scan;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.repository.OrganizationRepository;
import com.cyberas.domain.risk.BusinessSector;
import com.cyberas.security.InvitationCodes;
import com.cyberas.security.JwtContext;
import com.cyberas.security.Roles;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Projets d'évaluation : plusieurs sociétés évaluées, puis classées par mérite.
 *
 * <h2>Ce qu'un projet fait pour chaque société</h2>
 *
 * <p>Inscrire une société, c'est en une opération : créer son organisation si
 * elle n'existe pas encore, <strong>créer le compte de son responsable</strong>,
 * lui ouvrir un audit dédié au projet, et émettre le lien par lequel ce compte
 * s'active. Le compte existe donc avant que la société n'ait rien fait : le
 * lien ne crée rien, il ouvre un accès déjà en place — la personne choisit son
 * mot de passe et entre. La société travaille ensuite dans son propre espace,
 * cloisonné comme celui de n'importe quel client ; le projet ne fait que
 * relire ce qu'elle y a produit.
 *
 * <h2>Le score de mérite</h2>
 *
 * <p>Deux mesures existent déjà et disent des choses différentes : la maturité
 * déclarée par le questionnaire (0 à 4, plus c'est haut mieux c'est) et
 * l'exposition constatée par les scans (0 à 100, plus c'est haut pire c'est).
 * Les classer sur l'une seule serait trompeur — une société qui répond bien au
 * questionnaire mais dont le scan révèle des failles critiques ne mérite pas
 * la première place.
 *
 * <p>Le mérite les combine sur 100 : 70 % de maturité déclarée, 30 % de
 * sécurité constatée (100 moins l'exposition). Sans scan abouti, la maturité
 * seule compte — la société n'est pas pénalisée pour un scan que personne n'a
 * lancé, ni récompensée par une exposition nulle qui ne mesure rien ; l'écran
 * le signale. Une société sans aucune réponse n'a pas de
 * score et n'est pas classée : la dernière place se lirait comme un résultat.
 */
@ApplicationScoped
public class EvaluationProjectService {

    private static final Logger LOG = Logger.getLogger(EvaluationProjectService.class);
    /** Un projet dure des semaines : le lien doit vivre autant. */
    private static final int INVITATION_DAYS = 30;

    @Inject
    JwtContext jwtContext;

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    AuthService authService;

    @Inject
    AuditService auditService;

    @Inject
    QuestionnaireService questionnaireService;

    @Inject
    RiskAssessmentService riskAssessmentService;

    // -----------------------------------------------------------------------
    // Projets
    // -----------------------------------------------------------------------

    public List<ProjectSummary> listProjects() {
        List<EvaluationProject> projects = EvaluationProject.list("order by createdAt desc");
        List<ProjectSummary> out = new ArrayList<>();
        for (EvaluationProject p : projects) {
            List<EvaluationParticipant> parts = participantsOf(p.id);
            int joined = 0;
            int answered = 0;
            for (EvaluationParticipant part : parts) {
                if (hasJoined(part)) joined++;
                if (part.audit != null && QuestionAnswer.count("audit.id = ?1", part.audit.id) > 0) answered++;
            }
            out.add(new ProjectSummary(p.id, p.name, p.description, p.status, p.deadline,
                parts.size(), joined, answered, p.createdAt, p.closedAt));
        }
        return out;
    }

    @Transactional
    public ProjectSummary createProject(String name, String description, LocalDate deadline) {
        if (name == null || name.trim().length() < 3) {
            throw new IllegalArgumentException("Le nom du projet doit faire au moins 3 caractères");
        }
        EvaluationProject p = new EvaluationProject();
        p.name = name.trim();
        p.description = description == null || description.isBlank() ? null : description.trim();
        p.deadline = deadline;
        p.createdBy = User.findById(jwtContext.getUserId());
        p.persist();
        return new ProjectSummary(p.id, p.name, p.description, p.status, p.deadline, 0, 0, 0,
            p.createdAt, null);
    }

    @Transactional
    public ProjectSummary closeProject(UUID projectId, boolean close) {
        EvaluationProject p = requireProject(projectId);
        p.status = close ? EvaluationProject.CLOSED : EvaluationProject.OPEN;
        p.closedAt = close ? LocalDateTime.now() : null;
        p.persist();
        return listProjects().stream().filter(s -> s.id().equals(projectId)).findFirst().orElseThrow();
    }

    @Transactional
    public void deleteProject(UUID projectId) {
        EvaluationProject p = requireProject(projectId);
        // Les organisations et audits des participantes restent : ils portent
        // des données que la société a saisies, le projet n'en est que le
        // lecteur. Seuls les liens non utilisés sont révoqués.
        for (EvaluationParticipant part : participantsOf(projectId)) {
            revokeIfPending(part.invitation);
        }
        EvaluationParticipant.delete("project.id", projectId);
        p.delete();
    }

    // -----------------------------------------------------------------------
    // Participantes
    // -----------------------------------------------------------------------

    /**
     * Inscrit une société et lui ouvre l'accès.
     *
     * <p>Si une organisation porte déjà ce nom, elle est réutilisée : une
     * société déjà cliente peut être inscrite à un projet sans dupliquer son
     * espace. Un audit propre au projet lui est ouvert dans tous les cas, pour
     * que ses réponses au projet ne se mélangent pas à ses audits antérieurs.
     */
    @Transactional
    public AddedParticipant addParticipant(UUID projectId, String organizationName, String sector,
                                          String contactName, String contactEmail) {
        EvaluationProject project = requireProject(projectId);
        if (EvaluationProject.CLOSED.equals(project.status)) {
            throw new IllegalStateException("Ce projet est clos : rouvrez-le pour ajouter une société");
        }
        if (organizationName == null || organizationName.trim().length() < 2) {
            throw new IllegalArgumentException("Le nom de la société est requis");
        }
        if (contactEmail == null || contactEmail.isBlank()) {
            throw new IllegalArgumentException(
                "Le courriel du responsable est requis : c'est le compte que le lien d'accès activera");
        }
        String name = organizationName.trim();
        String email = contactEmail.trim().toLowerCase();

        Organization org = organizationRepository.findByName(name).orElse(null);
        boolean created = false;
        if (org == null) {
            org = new Organization();
            org.name = name;
            org.description = "Inscrite au projet « " + project.name + " »";
            org.sector = BusinessSector.from(sector).name();
            org.active = true;
            org.createdBy = jwtContext.getUserId();
            org.persist();
            authService.ensureSystemRoles(org);
            created = true;
        } else if (sector != null && !sector.isBlank() && org.sector == null) {
            org.sector = BusinessSector.from(sector).name();
        }

        if (EvaluationParticipant.count("project.id = ?1 and organization.id = ?2", projectId, org.id) > 0) {
            throw new IllegalArgumentException("Cette société est déjà inscrite à ce projet");
        }

        // Le compte du responsable : créé maintenant, activé par le lien. S'il
        // existe déjà (société déjà cliente), le lien lui permettra de choisir
        // un nouveau mot de passe.
        String[] names = splitName(contactName);
        if (User.count("organization.id = ?1 and email = ?2", org.id, email) == 0) {
            authService.provisionUser(org, email, names[0], names[1], Roles.ADMIN);
        }

        EvaluationParticipant part = new EvaluationParticipant();
        part.project = project;
        part.organization = org;
        part.contactName = blankToNull(contactName);
        part.contactEmail = email;
        part.audit = openAudit(project, org);
        part.persist();

        String plainCode = InvitationCodes.generate();
        part.invitation = issueInvitation(part, plainCode);
        part.persist();

        return new AddedParticipant(toRow(part), plainCode, "/inscription?invitation=" + plainCode, created);
    }

    /** Nouveau lien : l'ancien, s'il n'a pas servi, cesse de fonctionner. */
    @Transactional
    public AddedParticipant renewInvitation(UUID projectId, UUID participantId) {
        EvaluationParticipant part = requireParticipant(projectId, participantId);
        revokeIfPending(part.invitation);
        String plainCode = InvitationCodes.generate();
        part.invitation = issueInvitation(part, plainCode);
        part.persist();
        return new AddedParticipant(toRow(part), plainCode, "/inscription?invitation=" + plainCode, false);
    }

    @Transactional
    public void removeParticipant(UUID projectId, UUID participantId) {
        EvaluationParticipant part = requireParticipant(projectId, participantId);
        revokeIfPending(part.invitation);
        part.delete();
    }

    /**
     * Réponses d'une société au questionnaire du projet, question par question.
     *
     * <p>Les questions sans réponse sont listées aussi : ce qu'une société n'a
     * pas renseigné fait partie de ce que l'évaluateur veut voir.
     */
    public ParticipantAnswers answersOf(UUID projectId, UUID participantId) {
        EvaluationParticipant part = requireParticipant(projectId, participantId);
        if (part.audit == null) {
            return new ParticipantAnswers(toRow(part), List.of());
        }
        List<Question> questions = questionnaireService.questionsFor(part.audit.id);
        List<QuestionAnswer> answers = QuestionAnswer.list("audit.id = ?1", part.audit.id);
        Map<UUID, QuestionAnswer> byQuestion = new java.util.HashMap<>();
        for (QuestionAnswer a : answers) {
            byQuestion.put(a.question.id, a);
        }
        List<AnswerRow> rows = new ArrayList<>();
        for (Question q : questions) {
            QuestionAnswer a = byQuestion.get(q.id);
            rows.add(new AnswerRow(q.code, q.domain, q.text, q.weight,
                a == null ? null : a.maturityLevel,
                a == null ? null : a.comment,
                a == null ? null : a.answeredAt,
                a == null || a.answeredBy == null ? null : a.answeredBy.email));
        }
        return new ParticipantAnswers(toRow(part), rows);
    }

    // -----------------------------------------------------------------------
    // Évaluation et classement
    // -----------------------------------------------------------------------

    /** Le projet avec ses participantes, dans l'ordre du mérite. */
    public ProjectDetail detail(UUID projectId) {
        EvaluationProject p = requireProject(projectId);
        List<ParticipantRow> rows = new ArrayList<>();
        for (EvaluationParticipant part : participantsOf(projectId)) {
            rows.add(toRow(part));
        }
        return new ProjectDetail(p.id, p.name, p.description, p.status, p.deadline,
            p.createdAt, p.closedAt, rank(rows));
    }

    /**
     * Recalcule le score de chaque société à partir de ses constats, puis
     * renvoie le classement à jour.
     *
     * <p>Une société dont l'évaluation échoue (audit sans version, moteur en
     * erreur) garde son dernier score connu et n'empêche pas les autres d'être
     * évaluées.
     */
    public ProjectDetail evaluate(UUID projectId) {
        for (EvaluationParticipant part : participantsOf(projectId)) {
            if (part.audit == null) continue;
            try {
                riskAssessmentService.assessAudit(part.audit.id);
            } catch (RuntimeException e) {
                LOG.warnf("Projet %s : évaluation impossible pour %s (%s)", projectId,
                    part.organization.name, e.getMessage());
            }
        }
        return detail(projectId);
    }

    /**
     * Pose les rangs : mérite décroissant, puis taux de réponse, puis nom.
     * Les sociétés sans score suivent, sans rang.
     */
    private List<ParticipantRow> rank(List<ParticipantRow> rows) {
        rows.sort(Comparator
            .comparing((ParticipantRow r) -> r.meritScore() == null)
            .thenComparing(r -> r.meritScore() == null ? 0 : -r.meritScore())
            .thenComparing(r -> -r.completionRate())
            .thenComparing(ParticipantRow::organizationName, String.CASE_INSENSITIVE_ORDER));
        List<ParticipantRow> out = new ArrayList<>();
        int rank = 0;
        for (ParticipantRow r : rows) {
            out.add(r.meritScore() == null ? r : r.withRank(++rank));
        }
        return out;
    }

    private ParticipantRow toRow(EvaluationParticipant part) {
        Organization org = part.organization;
        Audit audit = part.audit;

        double completion = 0;
        int answered = 0;
        int applicable = 0;
        Double maturity = null;
        Integer riskScore = null;
        String riskLevel = null;
        LocalDateTime assessedAt = null;
        int scansDone = 0;
        int scansTotal = 0;
        int critical = 0;
        int high = 0;
        LocalDateTime lastAnswer = null;

        if (audit != null) {
            List<Question> questions = questionnaireService.questionsFor(audit.id);
            List<QuestionAnswer> answers = QuestionAnswer.list("audit.id = ?1", audit.id);
            QuestionnaireService.Summary summary = questionnaireService.summarize(questions, answers);
            // Le résumé donne un ratio 0-1 ; l'écran attend un pourcentage.
            completion = summary.completionRate() * 100.0;
            answered = summary.answeredQuestions();
            applicable = summary.applicableQuestions();
            maturity = summary.maturityScore();
            for (QuestionAnswer a : answers) {
                if (a.answeredAt != null && (lastAnswer == null || a.answeredAt.isAfter(lastAnswer))) {
                    lastAnswer = a.answeredAt;
                }
            }

            AuditRiskAssessment current = AuditRiskAssessment.find(
                "audit.id = ?1 and isCurrent = true", audit.id).firstResult();
            if (current != null) {
                riskScore = current.riskScore;
                riskLevel = current.riskLevel;
                assessedAt = current.calculatedAt;
            }

            List<Scan> scans = Scan.list("audit.id = ?1", audit.id);
            scansTotal = scans.size();
            for (Scan s : scans) {
                if (s.isCompleted()) scansDone++;
            }
            critical = (int) Finding.count("audit.id = ?1 and severity = 'CRITICAL' and status <> 'FALSE_POSITIVE'", audit.id);
            high = (int) Finding.count("audit.id = ?1 and severity = 'HIGH' and status <> 'FALSE_POSITIVE'", audit.id);
        }

        Double merit = merit(maturity, riskScore, scansDone);

        Invitation inv = part.invitation;
        String invitationStatus = inv == null ? null : inv.status();
        long members = User.count("organization.id = ?1 and active = true", org.id);

        return new ParticipantRow(
            part.id, org.id, org.name, org.sector, BusinessSector.from(org.sector).label(),
            part.contactName, part.contactEmail,
            audit == null ? null : audit.id,
            invitationStatus, inv == null ? null : inv.expiresAt, hasJoined(part), members,
            applicable, answered, round1(completion), lastAnswer,
            maturity == null ? null : round2(maturity),
            riskScore, riskLevel, assessedAt,
            scansTotal, scansDone, critical, high,
            merit == null ? null : round1(merit),
            null);
    }

    /**
     * Mérite sur 100.
     *
     * <p>70 % de maturité déclarée (0-4 ramené sur 100), 30 % de sécurité
     * constatée (100 moins l'exposition) quand au moins un scan a abouti ;
     * sinon la maturité seule. Sans scan, le moteur produit une exposition de
     * zéro — non pas parce que la société est sûre, mais parce que rien n'a été
     * regardé ; la compter offrirait 30 points à qui n'a rien scanné.
     */
    static Double merit(Double maturity, Integer riskScore, int scansCompleted) {
        if (maturity == null) return null;
        double declared = maturity / 4.0 * 100.0;
        if (riskScore == null || scansCompleted == 0) return declared;
        double observed = 100.0 - Math.max(0, Math.min(100, riskScore));
        return declared * 0.7 + observed * 0.3;
    }

    // -----------------------------------------------------------------------
    // Interne
    // -----------------------------------------------------------------------

    private Audit openAudit(EvaluationProject project, Organization org) {
        AuditDtos.CreateAuditRequest req = new AuditDtos.CreateAuditRequest();
        // Le code doit être unique dans l'organisation : le préfixe du projet
        // suffit, une société n'est inscrite qu'une fois par projet.
        req.auditCode = "EVAL-" + project.id.toString().substring(0, 8).toUpperCase();
        req.title = "Évaluation — " + project.name;
        req.description = project.description;
        req.scheduledStartDate = LocalDate.now();
        req.scheduledEndDate = project.deadline;
        AuditDtos.AuditResponse created = auditService.createAudit(req, org.id);
        return Audit.findById(created.id);
    }

    /** Le code en clair n'existe que le temps de la réponse ; la base garde son empreinte. */
    private Invitation issueInvitation(EvaluationParticipant part, String plainCode) {
        Invitation inv = new Invitation();
        inv.organization = part.organization;
        inv.code = InvitationCodes.hash(plainCode);
        inv.codeHint = InvitationCodes.hint(plainCode);
        inv.email = part.contactEmail;
        // La société administre son propre espace : elle invite ensuite qui
        // elle veut.
        inv.role = Roles.ADMIN;
        inv.expiresAt = LocalDateTime.now().plusDays(INVITATION_DAYS);
        inv.createdBy = User.findById(jwtContext.getUserId());
        inv.persist();
        return inv;
    }

    private void revokeIfPending(Invitation inv) {
        if (inv != null && inv.isUsable()) {
            inv.revokedAt = LocalDateTime.now();
            inv.persist();
        }
    }

    /**
     * Entrée effective : lien activé, ou quelqu'un de l'organisation s'est déjà
     * connecté. Le simple compte pré-créé ne compte pas — il existe avant que
     * la société n'ait rien fait.
     */
    private boolean hasJoined(EvaluationParticipant part) {
        if (part.invitation != null && part.invitation.usedAt != null) return true;
        return User.count("organization.id = ?1 and active = true and lastLoginAt is not null",
            part.organization.id) > 0;
    }

    /** « Prénom Nom » → prénom, nom ; un seul mot devient le nom. */
    private static String[] splitName(String full) {
        if (full == null || full.isBlank()) return new String[] {null, null};
        String[] parts = full.trim().split("\\s+", 2);
        return parts.length == 1 ? new String[] {null, parts[0]} : new String[] {parts[0], parts[1]};
    }

    private List<EvaluationParticipant> participantsOf(UUID projectId) {
        return EvaluationParticipant.list("project.id = ?1 order by createdAt", projectId);
    }

    private EvaluationProject requireProject(UUID id) {
        EvaluationProject p = EvaluationProject.findById(id);
        if (p == null) throw new IllegalArgumentException("Projet introuvable");
        return p;
    }

    private EvaluationParticipant requireParticipant(UUID projectId, UUID participantId) {
        EvaluationParticipant part = EvaluationParticipant.find(
            "id = ?1 and project.id = ?2", participantId, projectId).firstResult();
        if (part == null) throw new IllegalArgumentException("Société introuvable dans ce projet");
        return part;
    }


    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static double round1(double v) { return Math.round(v * 10) / 10.0; }
    private static double round2(double v) { return Math.round(v * 100) / 100.0; }

    // -----------------------------------------------------------------------
    // Vues
    // -----------------------------------------------------------------------

    public record ProjectSummary(
        UUID id, String name, String description, String status, LocalDate deadline,
        int participants, int joined, int answering,
        LocalDateTime createdAt, LocalDateTime closedAt) {}

    public record ProjectDetail(
        UUID id, String name, String description, String status, LocalDate deadline,
        LocalDateTime createdAt, LocalDateTime closedAt,
        List<ParticipantRow> participants) {}

    public record ParticipantRow(
        UUID id,
        UUID organizationId,
        String organizationName,
        String sector,
        String sectorLabel,
        String contactName,
        String contactEmail,
        UUID auditId,
        /** PENDING, USED, EXPIRED, REVOKED ; null si aucun lien n'a été émis. */
        String invitationStatus,
        LocalDateTime invitationExpiresAt,
        boolean joined,
        long members,
        int applicableQuestions,
        int answeredQuestions,
        double completionRate,
        LocalDateTime lastAnswerAt,
        /** Maturité déclarée 0-4 ; null sans réponse. */
        Double maturityScore,
        /** Exposition constatée 0-100 ; null sans évaluation. */
        Integer riskScore,
        String riskLevel,
        LocalDateTime assessedAt,
        int scansTotal,
        int scansCompleted,
        int criticalFindings,
        int highFindings,
        /** Mérite sur 100 ; null sans réponse. */
        Double meritScore,
        /** 1 = meilleure société. Null si non classée. */
        Integer rank
    ) {
        ParticipantRow withRank(int value) {
            return new ParticipantRow(id, organizationId, organizationName, sector, sectorLabel,
                contactName, contactEmail, auditId, invitationStatus, invitationExpiresAt, joined,
                members, applicableQuestions, answeredQuestions, completionRate, lastAnswerAt,
                maturityScore, riskScore, riskLevel, assessedAt, scansTotal, scansCompleted,
                criticalFindings, highFindings, meritScore, value);
        }
    }

    /** Réponse d'ajout : seule occasion où le code complet du lien est renvoyé. */
    public record AddedParticipant(ParticipantRow participant, String invitationCode,
                                   String invitationPath, boolean organizationCreated) {}

    public record ParticipantAnswers(ParticipantRow participant, List<AnswerRow> answers) {}

    public record AnswerRow(String code, String domain, String text, Integer weight,
                            Integer maturityLevel, String comment,
                            LocalDateTime answeredAt, String answeredBy) {}
}
