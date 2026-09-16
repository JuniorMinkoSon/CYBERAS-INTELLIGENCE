package com.cyberas.security;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * En-têtes de sécurité posés sur chaque réponse de l'API.
 *
 * <p>L'API ne rend que du JSON et des fichiers : elle n'a aucune raison
 * d'être encadrée dans une page, d'être lue avec un type deviné par le
 * navigateur, ni d'exécuter quoi que ce soit. Les en-têtes le disent
 * explicitement ; sans eux, chaque navigateur applique ses propres défauts.
 *
 * <p>HSTS n'est envoyé qu'en production : en développement, l'API est servie
 * en clair sur localhost, et un HSTS mémorisé par le navigateur casserait
 * ensuite tout accès HTTP local pendant sa durée de vie.
 */
@Provider
public class SecurityHeadersFilter implements ContainerResponseFilter {

    @ConfigProperty(name = "security.hsts", defaultValue = "false")
    boolean hsts;

    @Override
    public void filter(ContainerRequestContext request, ContainerResponseContext response) {
        MultivaluedMap<String, Object> h = response.getHeaders();
        putIfAbsent(h, "X-Content-Type-Options", "nosniff");
        putIfAbsent(h, "X-Frame-Options", "DENY");
        putIfAbsent(h, "Referrer-Policy", "no-referrer");
        putIfAbsent(h, "Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        // Une API JSON n'a besoin d'aucune source : tout est interdit. Les
        // fichiers téléchargés restent lisibles, la politique ne concerne que
        // ce qu'un navigateur tenterait d'exécuter dans la réponse.
        putIfAbsent(h, "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
        putIfAbsent(h, "Cache-Control", "no-store");
        if (hsts) {
            putIfAbsent(h, "Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }
    }

    private static void putIfAbsent(MultivaluedMap<String, Object> headers, String name, String value) {
        if (!headers.containsKey(name)) {
            headers.putSingle(name, value);
        }
    }
}
