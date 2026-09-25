package com.cyberas.security;

import io.vertx.core.http.HttpServerRequest;
import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

/**
 * Renseigne l'adresse de l'appelant et son agent pour la durée de la requête.
 *
 * <p>L'adresse sert au journal d'audit et, surtout, à la limitation de débit :
 * c'est elle qui compose la clé du compteur, {@code login:<adresse>}.
 *
 * <p>Elle est lue sur la connexion, par Vert.x, et non sur un en-tête.
 * L'implémentation précédente faisait l'inverse, avec deux conséquences que le
 * premier passage des tests a mises au jour.
 *
 * <p><strong>Un.</strong> Elle lisait {@code X-Forwarded-For} en premier et
 * s'y fiait. Cet en-tête est posé par le client : il suffisait d'en changer la
 * valeur à chaque requête pour obtenir un compteur neuf et franchir la
 * limitation autant de fois qu'on voulait. La protection contre le bourrage
 * d'identifiants ne protégeait donc que ceux qui ne cherchaient pas à la
 * contourner.
 *
 * <p><strong>Deux.</strong> Sans cet en-tête, elle se rabattait sur une
 * propriété de requête Grizzly. Quarkus tourne sur Vert.x : cette propriété
 * n'existe pas, valait toujours {@code null}, et l'adresse restait donc nulle.
 * Tous les appelants partageaient alors le compteur {@code login:null} — cinq
 * échecs de connexion, d'où qu'ils viennent, et plus personne ne pouvait se
 * connecter. Un déni de service sur sa propre authentification, déclenchable
 * par n'importe qui.
 *
 * <p>Le cas du proxy n'est pas perdu pour autant. Il se règle par
 * {@code quarkus.http.proxy.proxy-address-forwarding}, que Vert.x applique
 * avant que la requête n'arrive ici : l'adresse distante est alors celle que
 * l'en-tête déclare, mais seulement là où la configuration dit qu'un proxy de
 * confiance se trouve devant. C'est la différence entre faire confiance à son
 * infrastructure et faire confiance à l'appelant.
 */
/*
 * La priorité place ce filtre avant tous ceux qui lisent le contexte.
 *
 * Elle valait AUTHENTICATION - 1, soit 999, quand RateLimitFilter porte
 * AUTHENTICATION - 2, soit 998. En JAX-RS, le plus petit nombre s'exécute le
 * premier : la limitation de débit lisait donc l'adresse de l'appelant avant
 * que ce filtre ne l'ait posée. Elle était nulle à chaque requête, et le
 * compteur retombait sur la clé unique « login:null » — un seul seau pour tous
 * les appelants du monde, où cinq échecs de connexion suffisaient à verrouiller
 * l'authentification de tout le monde.
 *
 * Un contexte doit être établi avant d'être consommé. AUTHENTICATION - 3 le
 * place devant la limitation comme devant l'authentification, et laisse un cran
 * libre entre les deux si un filtre devait un jour s'intercaler.
 */
@Provider
@Priority(Priorities.AUTHENTICATION - 3)
public class RequestContextFilter implements ContainerRequestFilter, ContainerResponseFilter {

    /** Longueur au-delà de laquelle l'agent est tronqué avant journalisation. */
    private static final int AGENT_MAX = 500;

    /**
     * La requête Vert.x sous-jacente.
     *
     * <p>Obtenue par {@code @Context} et non par {@code @Inject} : un
     * fournisseur JAX-RS n'est pas un haricot CDI ici, et l'injection y reste
     * silencieusement nulle. Le champ valait donc {@code null}, l'adresse avec
     * lui, et le compteur retombait sur la clé partagée {@code login:null} —
     * exactement le défaut que ce filtre est censé corriger. Rien ne le
     * signalait : ni avertissement au démarrage, ni erreur à l'exécution.
     */
    @Context
    HttpServerRequest requeteHttp;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String ip = adresseAppelant();
        if (ip != null) {
            RequestContext.setIpAddress(ip);
        }

        String ua = requestContext.getHeaderString("User-Agent");
        if (ua != null) {
            RequestContext.setUserAgent(ua.length() > AGENT_MAX ? ua.substring(0, AGENT_MAX) : ua);
        }
    }

    /**
     * Adresse de la connexion, telle que Vert.x la voit.
     *
     * <p>Rend {@code null} plutôt qu'une chaîne de repli : une adresse inventée
     * regrouperait sous une même clé des appelants distincts, ce qui est
     * exactement le défaut que ce filtre corrige. Les appelants dont l'adresse
     * est indéterminable sont traités par la limitation de débit comme un seul,
     * ce qui est le comportement prudent.
     */
    private String adresseAppelant() {
        if (requeteHttp == null || requeteHttp.remoteAddress() == null) {
            return null;
        }
        return requeteHttp.remoteAddress().hostAddress();
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext)
            throws IOException {
        RequestContext.clear();
    }
}
