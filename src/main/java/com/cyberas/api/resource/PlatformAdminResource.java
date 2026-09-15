package com.cyberas.api.resource;

import com.cyberas.domain.entity.Audit;
import com.cyberas.domain.entity.AuditRiskAssessment;
import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.framework.FrameworkCatalog;
import com.cyberas.domain.risk.BusinessSector;
import com.cyberas.domain.risk.SecurityPosture;
import com.cyberas.domain.service.PostureService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;

/**
 * Vue transverse de la plateforme.
 *
 * <h2>Pourquoi une ressource à part</h2>
 *
 * <p>Tout le reste de l'API est cloisonné par organisation : chaque requête est
 * bornée par l'organisation portée par le jeton, et c'est ce qui garantit qu'un
 * client ne voit pas les données d'un autre. Cette ressource fait exactement
 * l'inverse — elle regarde toutes les organisations à la fois.
 *
 * <p>Elle est donc isolée dans son propre fichier, sous son propre chemin, avec
 * un contrôle de rôle en tête de chaque méthode. Ajouter ces requêtes dans les
 * ressources existantes aurait mélangé deux régimes d'accès dans le même
 * endroit, et il aurait suffi d'un oubli pour qu'une requête cloisonnée cesse
 * de l'être.
 */
@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
public class PlatformAdminResource {

    @Inject
    JwtContext jwtContext;

    @Inject
    PostureService postureService;

    @Inject
    com.cyberas.security.PlatformAccess access;

    /**
     * Entreprises auditées et leur score de sécurité.
     *
     * <p>Le score retenu par organisation est le <strong>plus élevé</strong>
     * parmi ses audits courants, jamais une moyenne : une entreprise dont un
     * audit est critique et trois sont sains n'est pas « moyennement
     * exposée », elle a un problème critique. C'est la même règle que le score
     * consolidé affiché à chaque client sur son propre tableau de bord — les
     * deux vues doivent dire la même chose.
     */
    @GET
    @Path("/organizations")
    public Response organizations() {
        if (!isPlatformAdmin()) {
            return forbidden();
        }

        List<Organization> orgs = Organization.list("deletedAt is null order by name");
        List<OrganizationOverview> rows = new ArrayList<>();

        for (Organization org : orgs) {
            List<AuditRiskAssessment> assessments = AuditRiskAssessment.list(
                "organization.id = ?1 and isCurrent = true order by riskScore desc", org.id);

            long audits = Audit.count("organization.id = ?1", org.id);
            long users = User.count("organization.id = ?1", org.id);

            Integer score = null;
            String level = null;
            int findings = 0;
            int critical = 0;
            int high = 0;
            LocalDateTime lastAssessed = null;

            if (!assessments.isEmpty()) {
                AuditRiskAssessment worst = assessments.get(0);
                score = worst.riskScore;
                level = worst.riskLevel;
                lastAssessed = worst.calculatedAt;

                for (AuditRiskAssessment a : assessments) {
                    findings += a.findingsCount == null ? 0 : a.findingsCount;
                    critical += a.criticalCount == null ? 0 : a.criticalCount;
                    high += a.highCount == null ? 0 : a.highCount;
                    if (a.calculatedAt != null
                            && (lastAssessed == null || a.calculatedAt.isAfter(lastAssessed))) {
                        lastAssessed = a.calculatedAt;
                    }
                }
            }

            BusinessSector sector = BusinessSector.from(org.sector);

            rows.add(new OrganizationOverview(
                org.id,
                org.name,
                org.sector,
                sector.label(),
                org.active,
                audits,
                users,
                // Un score absent reste nul : une organisation qui n'a jamais
                // été évaluée n'est pas « à zéro », elle est inconnue. Afficher
                // 0 la ferait passer pour la mieux notée du tableau.
                score,
                level,
                assessments.size(),
                findings,
                critical,
                high,
                lastAssessed,
                org.createdAt,
                // Les rangs ne peuvent être posés qu'une fois toutes les
                // organisations connues et triées : ils sont renseignés après.
                null, null, null
            ));
        }

        // Les plus exposées d'abord ; celles jamais évaluées en fin de liste,
        // sans être confondues avec les mieux notées.
        rows.sort(Comparator
            .comparing((OrganizationOverview o) -> o.riskScore() == null)
            .thenComparing(o -> o.riskScore() == null ? 0 : -o.riskScore()));

        return Response.ok(withRanks(rows)).build();
    }

    /**
     * Pose les rangs sur une liste déjà triée par exposition décroissante.
     *
     * <p>Une organisation jamais évaluée ne reçoit aucun rang : lui en donner
     * un la placerait dans un classement auquel elle n'a pas participé, et la
     * dernière place se lirait comme un bon résultat.
     *
     * <p>Le rang sectoriel n'a de sens que comparé à des pairs : c'est la seule
     * comparaison défendable, un hôpital et une association n'ayant ni le même
     * niveau d'exigence ni les mêmes moyens.
     */
    private List<OrganizationOverview> withRanks(List<OrganizationOverview> sorted) {
        Map<String, Integer> sectorCounters = new HashMap<>();
        Map<String, Long> sectorTotals = sorted.stream()
            .filter(o -> o.riskScore() != null)
            .collect(Collectors.groupingBy(
                o -> o.sector() == null ? "AUTRE" : o.sector(), Collectors.counting()));

        List<OrganizationOverview> out = new ArrayList<>();
        int rank = 0;
        for (OrganizationOverview o : sorted) {
            if (o.riskScore() == null) {
                out.add(o.withRanks(null, null, null));
                continue;
            }
            rank++;
            String key = o.sector() == null ? "AUTRE" : o.sector();
            int inSector = sectorCounters.merge(key, 1, Integer::sum);
            out.add(o.withRanks(rank, inSector, sectorTotals.getOrDefault(key, 0L).intValue()));
        }
        return out;
    }

    /**
     * Classement par secteur d'activité.
     *
     * <p>Comparer un hôpital à une association n'a pas de sens : ils n'ont ni
     * les mêmes obligations ni les mêmes moyens. Le regroupement sectoriel est
     * la seule comparaison défendable, et c'est aussi celle qui intéresse un
     * client — savoir où il se situe par rapport à ses pairs.
     *
     * <p>La moyenne porte sur les seules organisations évaluées. Compter les
     * autres pour zéro ferait paraître un secteur peu équipé en meilleure santé
     * que les autres.
     */
    @GET
    @Path("/rankings/sectors")
    public Response sectorRanking() {
        if (!isPlatformAdmin()) {
            return forbidden();
        }

        List<Organization> orgs = Organization.list("deletedAt is null");
        Map<String, List<Integer>> scoresBySector = new LinkedHashMap<>();
        Map<String, Integer> countsBySector = new LinkedHashMap<>();

        for (Organization org : orgs) {
            String key = BusinessSector.from(org.sector).name();
            countsBySector.merge(key, 1, Integer::sum);

            List<AuditRiskAssessment> assessments = AuditRiskAssessment.list(
                "organization.id = ?1 and isCurrent = true order by riskScore desc", org.id);
            if (!assessments.isEmpty() && assessments.get(0).riskScore != null) {
                scoresBySector.computeIfAbsent(key, k -> new ArrayList<>())
                    .add(assessments.get(0).riskScore);
            }
        }

        List<SectorRanking> rows = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : countsBySector.entrySet()) {
            List<Integer> scores = scoresBySector.getOrDefault(entry.getKey(), List.of());
            Double average = scores.isEmpty() ? null
                : scores.stream().mapToInt(Integer::intValue).average().orElse(0);
            Integer worst = scores.isEmpty() ? null
                : scores.stream().mapToInt(Integer::intValue).max().orElse(0);
            Integer best = scores.isEmpty() ? null
                : scores.stream().mapToInt(Integer::intValue).min().orElse(0);

            BusinessSector sector = BusinessSector.from(entry.getKey());
            rows.add(new SectorRanking(
                entry.getKey(), sector.label(), entry.getValue(), scores.size(),
                average == null ? null : Math.round(average * 10) / 10.0,
                best, worst,
                sector.defaultImpact().name(), sector.defaultDataSensitivity().name(),
                null));
        }

        // Secteurs les plus exposés en tête ; ceux sans évaluation en fin de
        // liste, jamais confondus avec les mieux notés.
        rows.sort(Comparator
            .comparing((SectorRanking r) -> r.averageScore() == null)
            .thenComparing(r -> r.averageScore() == null ? 0 : -r.averageScore()));

        List<SectorRanking> ranked = new ArrayList<>();
        int rank = 0;
        for (SectorRanking r : rows) {
            ranked.add(r.averageScore() == null ? r : r.withRank(++rank));
        }
        return Response.ok(ranked).build();
    }

    /**
     * Classement par domaine de sécurité, toutes organisations confondues.
     *
     * <p>Montre où le portefeuille est structurellement faible : si la gestion
     * des accès ressort dernière chez presque tous les clients, c'est un sujet
     * de contenu de mission, pas un incident isolé.
     *
     * <p>Les domaines fondateurs sont signalés : leur faiblesse ne coûte pas
     * seulement leurs propres points, elle plafonne la posture de tout le reste.
     */
    @GET
    @Path("/rankings/domains")
    public Response domainRanking() {
        if (!isPlatformAdmin()) {
            return forbidden();
        }

        Map<String, List<Double>> byDomain = new LinkedHashMap<>();
        Map<String, Integer> weakByDomain = new LinkedHashMap<>();

        for (Audit audit : Audit.<Audit>listAll()) {
            if (audit.organization == null) {
                continue;
            }
            PostureService.PostureReport report;
            try {
                report = postureService.evaluate(audit.id, audit.organization.id);
            } catch (RuntimeException e) {
                // Un audit dont le questionnaire n'est pas exploitable ne doit
                // pas faire échouer le classement de tous les autres.
                continue;
            }
            for (PostureService.DomainPosture d : report.domains()) {
                if (d.maturityScore() == null) {
                    continue;
                }
                byDomain.computeIfAbsent(d.domain(), k -> new ArrayList<>()).add(d.maturityScore());
                weakByDomain.merge(d.domain(), d.weakControls(), Integer::sum);
            }
        }

        List<DomainRanking> rows = new ArrayList<>();
        for (Map.Entry<String, List<Double>> entry : byDomain.entrySet()) {
            double avg = entry.getValue().stream()
                .mapToDouble(Double::doubleValue).average().orElse(0);
            rows.add(new DomainRanking(
                entry.getKey(),
                Math.round(avg * 100) / 100.0,
                SecurityPosture.fromMaturity(avg).label(),
                entry.getValue().size(),
                weakByDomain.getOrDefault(entry.getKey(), 0),
                Arrays.asList(SecurityPosture.FOUNDATIONAL_DOMAINS).contains(entry.getKey()),
                FrameworkCatalog.forDomain(entry.getKey()),
                null));
        }

        // Les domaines les plus faibles en tête : c'est là qu'il faut agir.
        rows.sort(Comparator.comparingDouble(DomainRanking::averageMaturity));

        List<DomainRanking> ranked = new ArrayList<>();
        int rank = 0;
        for (DomainRanking r : rows) {
            ranked.add(r.withRank(++rank));
        }
        return Response.ok(ranked).build();
    }

    /** Compteurs de tête pour le tableau de bord d'administration. */
    @GET
    @Path("/summary")
    public Response summary() {
        if (!isPlatformAdmin()) {
            return forbidden();
        }

        long organizations = Organization.count("deletedAt is null");
        long audits = Audit.count();
        long users = User.count();
        long assessed = AuditRiskAssessment.count("isCurrent = true");

        return Response.ok(new PlatformSummary(organizations, audits, users, assessed)).build();
    }

    /**
     * Rôle ADMIN <em>et</em> organisation qui administre la plateforme.
     *
     * <p>Le rôle seul ouvrait cette vue à la première personne inscrite de
     * chaque société — toutes reçoivent ADMIN. Voir {@link PlatformAccess}.
     */
    private boolean isPlatformAdmin() {
        return access.isPlatformAdmin();
    }

    private Response forbidden() {
        if (!jwtContext.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Authentification requise")).build();
        }
        return Response.status(Response.Status.FORBIDDEN)
            .entity(new ErrorResponse("Réservé à l'administration de la plateforme")).build();
    }

    public record OrganizationOverview(
        UUID id,
        String name,
        String sector,
        String sectorLabel,
        Boolean active,
        long auditCount,
        long userCount,
        /** Score le plus élevé parmi les audits courants ; null si jamais évaluée. */
        Integer riskScore,
        String riskLevel,
        int assessedAudits,
        int findingsCount,
        int criticalCount,
        int highCount,
        LocalDateTime lastAssessedAt,
        LocalDateTime createdAt,
        /**
         * Position dans le classement par exposition : 1 = organisation la plus
         * exposée. C'est l'ordre de traitement d'un portefeuille, pas un
         * palmarès — une place haute est une mauvaise nouvelle.
         */
        Integer exposureRank,
        /** Même classement, restreint aux organisations du même secteur. */
        Integer sectorRank,
        /** Nombre d'organisations évaluées dans ce secteur, rang compris. */
        Integer sectorPeers
    ) {

        /**
         * Copie avec les rangs renseignés, une fois le tri effectué.
         *
         * <p>Les paramètres sont nommés {@code globalRank} et {@code inSector}
         * plutôt que {@code sector} : ce dernier masquerait le composant du
         * record portant le code du secteur, et la copie recopierait un rang à
         * la place d'un secteur — une erreur silencieuse.
         */
        public OrganizationOverview withRanks(Integer globalRank, Integer inSector, Integer peers) {
            return new OrganizationOverview(id, name, sector, sectorLabel, active,
                auditCount, userCount, riskScore, riskLevel, assessedAudits,
                findingsCount, criticalCount, highCount, lastAssessedAt, createdAt,
                globalRank, inSector, peers);
        }
    }

    public record SectorRanking(
        String sector,
        String sectorLabel,
        int organizations,
        int assessedOrganizations,
        /** Moyenne des scores d'exposition ; null si aucune organisation évaluée. */
        Double averageScore,
        Integer bestScore,
        Integer worstScore,
        /** Impact métier retenu par défaut pour ce secteur (approche MEHARI). */
        String defaultImpact,
        String defaultDataSensitivity,
        Integer rank
    ) {
        public SectorRanking withRank(int value) {
            return new SectorRanking(sector, sectorLabel, organizations, assessedOrganizations,
                averageScore, bestScore, worstScore, defaultImpact, defaultDataSensitivity, value);
        }
    }

    public record DomainRanking(
        String domain,
        double averageMaturity,
        String postureLabel,
        int assessedAudits,
        int weakControls,
        boolean foundational,
        List<FrameworkCatalog.Reference> frameworkRefs,
        Integer rank
    ) {
        public DomainRanking withRank(int value) {
            return new DomainRanking(domain, averageMaturity, postureLabel, assessedAudits,
                weakControls, foundational, frameworkRefs, value);
        }
    }

    public record PlatformSummary(
        long organizations,
        long audits,
        long users,
        long assessedAudits
    ) {
    }

    public record ErrorResponse(String error) {
    }
}
