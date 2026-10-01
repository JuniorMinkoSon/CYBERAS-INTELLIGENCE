package com.cyberas.domain.service;

import com.cyberas.domain.entity.Organization;
import com.cyberas.domain.entity.User;
import com.cyberas.domain.repository.UserRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

/**
 * Compte de démonstration, créé au démarrage et seulement là où il doit l'être.
 *
 * <h2>Pourquoi un composant et non une migration</h2>
 *
 * <p>Une migration Flyway s'applique partout : dev, recette, production. Y
 * inscrire un compte dont le mot de passe est documenté reviendrait à livrer
 * une porte ouverte dans chaque environnement, et le jour où quelqu'un
 * l'oublie, elle reste. Un composant de démarrage se laisse fermer par
 * configuration, et il l'est par défaut.
 *
 * <p>Le mot de passe n'est d'ailleurs jamais écrit ici en clair vers la base :
 * il traverse {@link AuthService#createUser}, qui le passe par BCrypt comme
 * pour n'importe quel compte. Ce compte s'authentifie donc par le mécanisme
 * ordinaire, et rien dans l'application ne le traite à part.
 *
 * <h2>Ce qu'il garantit</h2>
 *
 * <p>Idempotence : l'existence du compte est vérifiée avant toute écriture, si
 * bien qu'un redémarrage ne crée pas de doublon et ne réinitialise pas un mot
 * de passe que quelqu'un aurait changé.
 *
 * <p>Rattachement : le compte rejoint l'organisation nommée si elle existe,
 * plutôt que d'en créer une seconde qui serait vide. Sur une base neuve, où
 * aucune organisation n'existe encore, elle est créée — sinon le compte n'aurait
 * nulle part où aller, et l'environnement de développement démarrerait sans
 * aucun moyen de se connecter.
 *
 * <h2>Activation</h2>
 *
 * <p>{@code cyberas.seed.demo}, faux par défaut, vrai sous le profil de
 * développement. Le défaut compte plus que le réglage : une instance qui ne dit
 * rien n'amorce rien.
 */
@ApplicationScoped
public class DemoAccountSeeder {

    private static final Logger LOG = Logger.getLogger(DemoAccountSeeder.class);

    /** Organisation d'accueil. Rejointe si elle existe, créée seulement sinon. */
    static final String ORGANISATION = "Demonstration Interne";

    static final String EMAIL = "demo.riskmap@cyberas.local";
    static final String PRENOM = "Demo";
    static final String NOM = "Risk Map";

    /**
     * AUDITOR, et non ADMIN.
     *
     * <p>Les écrans de la cartographie n'exigent aucun rôle particulier : les
     * ressources concernées demandent une session authentifiée, et le filtrage
     * se fait sur l'organisation. Donner ADMIN à un compte de démonstration
     * élargirait donc ses droits sans rien débloquer, et masquerait une
     * régression le jour où un contrôle de rôle serait ajouté.
     */
    static final String ROLE = "AUDITOR";

    @ConfigProperty(name = "cyberas.seed.demo", defaultValue = "false")
    boolean actif;

    /**
     * Mot de passe du compte de démonstration.
     *
     * <p>Externalisé pour qu'un environnement partagé puisse en poser un autre
     * sans toucher au code. La valeur par défaut n'est utile que sur un poste
     * de développement, où le compte est de toute façon sans portée.
     */
    @ConfigProperty(name = "cyberas.seed.demo-password", defaultValue = "CyberasDemo@2026!")
    String motDePasse;

    @Inject
    AuthService authService;

    @Inject
    UserRepository userRepository;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (!actif) {
            return;
        }

        if (userRepository.find("lower(email) = ?1", EMAIL).firstResultOptional().isPresent()) {
            LOG.debugf("Compte de démonstration %s déjà présent, rien à faire", EMAIL);
            return;
        }

        Organization org = Organization.find("name = ?1", ORGANISATION).firstResult();
        boolean creee = false;
        if (org == null) {
            org = new Organization();
            org.name = ORGANISATION;
            org.persist();
            creee = true;
        }

        try {
            User user = authService.createUser(org, EMAIL, motDePasse, PRENOM, NOM, ROLE);
            LOG.infof("Compte de démonstration créé : %s (rôle %s, organisation « %s »%s). "
                    + "Désactivable par cyberas.seed.demo=false.",
                user.email, ROLE, org.name, creee ? ", organisation créée" : "");
        } catch (RuntimeException e) {
            // Un seed qui échoue ne doit pas empêcher l'application de démarrer :
            // c'est une commodité de développement, pas une dépendance.
            LOG.warnf("Compte de démonstration non créé : %s", e.getMessage());
        }
    }
}
