package com.cyberas.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * État courant des réponses d'un audit, par famille de domaines.
 *
 * <p>Une ligne par (organisation, audit, famille), alimentée réponse par
 * réponse depuis le topic {@code cyberas-answer-events}. Elle répond à la
 * question que le tableau de bord pose sans arrêt : où en est cette
 * organisation, famille par famille.
 *
 * <p>Elle ne remplace pas {@code QuestionAnswer}, qui reste la source de
 * vérité et la seule chose qu'un auditeur peut opposer. Cette table est une
 * vue matérialisée : elle peut être vidée et reconstruite intégralement en
 * rejouant le topic depuis son origine, ce que la configuration du
 * consommateur permet ({@code auto.offset.reset=earliest}).
 *
 * <p>La maille est la famille et non le domaine. Quatorze domaines sont la
 * bonne granularité pour répondre — chacun correspond à un sujet qu'une
 * personne précise maîtrise — mais pas pour rendre compte : quatorze barres
 * côte à côte ne se lisent pas. C'est le raisonnement que porte déjà
 * {@code DomainFamily}, et cette projection s'y range plutôt que d'inventer un
 * regroupement de plus.
 */
@Entity
@Table(name = "answer_projection_entries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "audit_id", "domain_family"}))
public class AnswerProjectionEntry extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    public Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_id", nullable = false)
    public Audit audit;

    @Column(name = "domain_family", nullable = false, length = 30)
    public String domainFamily;

    /** Réponses portant un degré de maturité, seules comptées dans la moyenne. */
    @Column(name = "answered_count", nullable = false)
    public Integer answeredCount = 0;

    /**
     * Réponses déclarées sans objet.
     *
     * <p>Comptées à part, jamais fondues dans la moyenne. Une mesure hors
     * périmètre ne creuse pas d'écart, et la compter comme un zéro ferait
     * baisser le score d'une organisation pour des questions qui ne la
     * concernent pas.
     */
    @Column(name = "not_applicable_count", nullable = false)
    public Integer notApplicableCount = 0;

    /** Réponses sous le seuil de faiblesse : celles qui appellent une action. */
    @Column(name = "gap_count", nullable = false)
    public Integer gapCount = 0;

    /**
     * Somme des degrés reçus.
     *
     * <p>Conservée plutôt que la moyenne : une moyenne ne se met pas à jour de
     * façon incrémentale sans son dénominateur, et le recalcul à la lecture
     * suppose de relire toutes les réponses, ce que cette projection existe
     * précisément pour éviter.
     */
    @Column(name = "maturity_sum", nullable = false)
    public Integer maturitySum = 0;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Degré de maturité moyen de la famille, ou {@code null} si rien n'y a
     * encore été répondu.
     *
     * <p>Rend {@code null} plutôt que zéro : une famille sans réponse n'a pas
     * une maturité nulle, elle n'a pas de maturité. Les confondre afficherait
     * un audit à peine commencé comme une organisation en échec.
     */
    public Double maturiteMoyenne() {
        if (answeredCount == null || answeredCount == 0) {
            return null;
        }
        return (double) maturitySum / answeredCount;
    }
}
