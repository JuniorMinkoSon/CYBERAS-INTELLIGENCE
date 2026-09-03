package com.cyberas.domain.service;

import com.cyberas.domain.entity.Finding;
import com.cyberas.domain.entity.FindingRiskAssessment;
import com.cyberas.domain.entity.Recommendation;
import com.cyberas.domain.repository.FindingRiskAssessmentRepository;
import com.cyberas.domain.repository.RecommendationRepository;
import com.cyberas.domain.risk.RiskLevel;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Génération des recommandations à partir des constats évalués.
 *
 * Déterministe et sourcée. Chaque recommandation cite un contrôle réel du
 * référentiel : une recommandation qui invoque une exigence normative inexistante
 * est pire qu'une absence de recommandation, car elle sera opposée à l'auditeur.
 * Les références utilisées ici proviennent de l'annexe A d'ISO/IEC 27001:2022.
 *
 * L'échéance découle du niveau de risque, pas d'un choix arbitraire : elle reprend
 * le délai de remédiation porté par RiskLevel.
 *
 * Ce service produit le socle factuel. L'enrichissement contextuel par modèle de
 * langage viendra s'y ajouter, sans jamais le remplacer : le score et le contrôle
 * cité doivent rester reproductibles.
 */
@ApplicationScoped
public class RecommendationService {

    private static final Logger LOG = Logger.getLogger(RecommendationService.class);

    /**
     * Trame de remédiation par service exposé.
     *
     * Le port seul ne dit pas s'il y a vulnérabilité : un port ouvert est un fait,
     * pas un défaut. La recommandation porte donc sur la justification de
     * l'exposition et son durcissement, pas sur une fermeture systématique.
     */
    private record ServiceGuidance(
        String problem,
        String risk,
        String recommendation,
        List<String> controls
    ) {
    }

    private static final Map<String, ServiceGuidance> GUIDANCE = Map.of(
        "SSH", new ServiceGuidance(
            "Un service SSH est accessible sur le périmètre audité.",
            "Un accès distant administrateur exposé élargit la surface d'attaque : "
                + "il concentre les tentatives d'authentification par force brute et, "
                + "en cas de compromission, donne un contrôle étendu de la machine.",
            "Restreindre l'accès SSH aux plages d'administration, désactiver "
                + "l'authentification par mot de passe au profit de clés, interdire la "
                + "connexion directe du compte root et journaliser les sessions.",
            List.of("A.8.20 Sécurité des réseaux", "A.8.5 Authentification sécurisée")),

        "HTTP", new ServiceGuidance(
            "Un service HTTP en clair est accessible sur le périmètre audité.",
            "Les échanges non chiffrés exposent identifiants, jetons de session et "
                + "données transmises à toute interception sur le chemin réseau.",
            "Rediriger l'ensemble du trafic vers HTTPS, activer HSTS et retirer "
                + "l'écoute en clair une fois la redirection vérifiée.",
            List.of("A.8.24 Utilisation de la cryptographie", "A.5.14 Transfert de l'information")),

        "HTTPS", new ServiceGuidance(
            "Un service HTTPS est accessible sur le périmètre audité.",
            "Une configuration TLS obsolète — protocoles dépréciés, suites faibles, "
                + "certificat expiré — annule la protection attendue du chiffrement.",
            "Vérifier la validité du certificat, n'accepter que TLS 1.2 et au-delà, "
                + "désactiver les suites de chiffrement faibles et planifier le "
                + "renouvellement des certificats.",
            List.of("A.8.24 Utilisation de la cryptographie")),

        "DNS", new ServiceGuidance(
            "Un service DNS est accessible sur le périmètre audité.",
            "Un résolveur ouvert peut être détourné en amplificateur d'attaque par "
                + "déni de service et servir à cartographier l'infrastructure interne.",
            "Restreindre la récursion aux clients légitimes, séparer résolveur interne "
                + "et serveur faisant autorité, limiter le débit des requêtes.",
            List.of("A.8.20 Sécurité des réseaux", "A.8.6 Dimensionnement")),

        "MySQL", new ServiceGuidance(
            "Un service de base de données MySQL est joignable depuis le périmètre audité.",
            "Une base de données atteignable au-delà de ses applications expose "
                + "directement les données qu'elle héberge.",
            "Restreindre l'écoute aux interfaces applicatives, filtrer les accès "
                + "réseau, imposer des comptes nominatifs et chiffrer les connexions.",
            List.of("A.8.20 Sécurité des réseaux", "A.8.3 Restriction d'accès à l'information")),

        "PostgreSQL", new ServiceGuidance(
            "Un service de base de données PostgreSQL est joignable depuis le périmètre audité.",
            "Une base de données atteignable au-delà de ses applications expose "
                + "directement les données qu'elle héberge.",
            "Restreindre l'écoute aux interfaces applicatives, durcir les règles "
                + "d'authentification et imposer le chiffrement des connexions.",
            List.of("A.8.20 Sécurité des réseaux", "A.8.3 Restriction d'accès à l'information")),

        "RDP", new ServiceGuidance(
            "Un service de bureau à distance est accessible sur le périmètre audité.",
            "Le bureau à distance exposé est une cible privilégiée : il combine "
                + "authentification par mot de passe et accès interactif complet.",
            "Placer l'accès derrière une passerelle ou un tunnel, imposer "
                + "l'authentification multifacteur et restreindre les adresses sources.",
            List.of("A.8.5 Authentification sécurisée", "A.8.20 Sécurité des réseaux")),

        "SMB", new ServiceGuidance(
            "Un service de partage de fichiers SMB est accessible sur le périmètre audité.",
            "SMB exposé permet l'énumération des partages et reste un vecteur "
                + "privilégié de propagation latérale.",
            "Interdire l'exposition de SMB hors du réseau interne, désactiver les "
                + "versions obsolètes du protocole et imposer la signature des échanges.",
            List.of("A.8.20 Sécurité des réseaux", "A.8.3 Restriction d'accès à l'information")),

        "FTP", new ServiceGuidance(
            "Un service FTP est accessible sur le périmètre audité.",
            "FTP transmet identifiants et contenus en clair : toute interception "
                + "révèle les accès et les fichiers échangés.",
            "Remplacer FTP par SFTP ou FTPS, puis retirer le service en clair.",
            List.of("A.8.24 Utilisation de la cryptographie", "A.5.14 Transfert de l'information"))
    );

    @Inject
    RecommendationRepository recommendationRepository;

    @Inject
    FindingRiskAssessmentRepository findingRiskRepository;

    @Inject
    ObjectMapper objectMapper;

    /**
     * Produit les recommandations manquantes pour un audit.
     *
     * Idempotent : une recommandation déjà émise pour un constat n'est pas
     * dupliquée, et celles que l'équipe a fait avancer ne sont pas réécrites.
     */
    @Transactional
    @ActivateRequestContext
    public List<Recommendation> generateForAudit(UUID auditId) {
        List<FindingRiskAssessment> assessments = findingRiskRepository.list(
            "audit.id = ?1 and isCurrent = true order by riskScore desc", auditId);

        List<Recommendation> created = new ArrayList<>();

        for (FindingRiskAssessment assessment : assessments) {
            Finding finding = assessment.finding;
            if (finding == null) {
                continue;
            }

            String sourceKey = buildSourceKey(finding);
            boolean exists = recommendationRepository
                .find("audit.id = ?1 and sourceKey = ?2", auditId, sourceKey)
                .firstResultOptional()
                .isPresent();
            if (exists) {
                continue;
            }

            ServiceGuidance guidance = resolveGuidance(finding);
            if (guidance == null) {
                continue;
            }

            RiskLevel level = RiskLevel.valueOf(assessment.riskLevel);

            Recommendation rec = new Recommendation();
            rec.organization = finding.organization;
            rec.audit = finding.audit;
            rec.finding = finding;
            rec.sourceKey = sourceKey;
            rec.problem = guidance.problem();
            rec.risk = guidance.risk() + " Risque évalué à " + assessment.riskScore
                + "/100 (" + level.label().toLowerCase() + ").";
            rec.recommendation = guidance.recommendation();
            rec.priority = toPriority(level);
            rec.frameworkRefs = buildFrameworkRefs(guidance.controls(), assessment);
            rec.dueDate = dueDate(level);
            rec.persist();

            created.add(rec);
        }

        LOG.infof("Audit %s : %d recommandation(s) générée(s) sur %d constat(s) évalué(s)",
            auditId, created.size(), assessments.size());
        return created;
    }

    /**
     * Identifiant stable d'une recommandation.
     *
     * Fondé sur ce que la recommandation traite — le service exposé — et non sur
     * l'identifiant du constat : un nouveau scan recrée des constats, et la clé
     * doit rester la même pour éviter les doublons à chaque exécution.
     */
    private String buildSourceKey(Finding finding) {
        String service = extractService(finding);
        String port = finding.sourceId == null ? "" : finding.sourceId;
        return "SCAN:" + service + ":" + port;
    }

    private ServiceGuidance resolveGuidance(Finding finding) {
        return GUIDANCE.get(extractService(finding));
    }

    /** Le service est porté par les preuves du scan, sinon déduit du titre. */
    private String extractService(Finding finding) {
        if (finding.evidence != null && finding.evidence.hasNonNull("service")) {
            return finding.evidence.get("service").asText();
        }
        String title = finding.title == null ? "" : finding.title;
        for (String service : GUIDANCE.keySet()) {
            if (title.toUpperCase().contains(service.toUpperCase())) {
                return service;
            }
        }
        return "Unknown";
    }

    /**
     * INFORMATION n'a pas d'équivalent côté priorité : une recommandation existe
     * parce qu'une action est attendue, elle démarre donc au moins en LOW.
     */
    private String toPriority(RiskLevel level) {
        return level == RiskLevel.INFORMATION ? "LOW" : level.name();
    }

    /** Échéance dérivée du délai de remédiation du niveau, jamais fixée à la main. */
    private LocalDate dueDate(RiskLevel level) {
        Integer days = level.remediationDays();
        return days == null ? null : LocalDate.now().plusDays(days);
    }

    /**
     * Références normatives et éléments d'appui.
     *
     * La source du constat et le score sont conservés avec les contrôles : une
     * recommandation doit pouvoir être remontée jusqu'à la donnée qui l'a motivée.
     */
    private ObjectNode buildFrameworkRefs(List<String> controls, FindingRiskAssessment assessment) {
        ObjectNode node = objectMapper.createObjectNode();
        ArrayNode iso = objectMapper.createArrayNode();
        controls.forEach(iso::add);
        node.set("ISO27001:2022", iso);
        node.put("riskScore", assessment.riskScore);
        node.put("riskLevel", assessment.riskLevel);
        node.put("confidence", Math.round(assessment.confidence * 100) / 100.0);
        node.put("engineVersion", assessment.engineVersion);
        node.put("evidenceSource", "NMAP");
        return node;
    }
}
