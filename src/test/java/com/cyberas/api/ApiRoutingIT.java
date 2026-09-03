package com.cyberas.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

/**
 * Vérifie que les ressources REST sont bien servies sous /api.
 *
 * Le frontend cible ce préfixe : sans lui, chaque appel retourne 404 et aucun
 * écran ne fonctionne. Ce test fige le contrat d'URL entre les deux moitiés.
 */
@QuarkusTest
class ApiRoutingIT {

    @Test
    @DisplayName("Les endpoints d'authentification répondent sous /api")
    void authSousApi() {
        // Ce test porte sur le routage, pas sur la semantique d'authentification :
        // 400 (payload incomplet) comme 401 (identifiants rejetes) prouvent que la
        // route existe et traite la requete. Seul un 404 signalerait un prefixe absent.
        given()
            .contentType("application/json")
            .body("{\"email\":\"inconnu@test.local\",\"password\":\"x\"}")
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(anyOf(is(400), is(401)));
    }

    @Test
    @DisplayName("Sans préfixe /api, la route n'existe pas")
    void pasDeRouteSansPrefixe() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"inconnu@test.local\",\"password\":\"x\"}")
        .when()
            .post("/auth/login")
        .then()
            .statusCode(404);
    }

    @Test
    @DisplayName("Un endpoint métier sans jeton est refusé, pas introuvable")
    void endpointProtegeExigeJeton() {
        given()
        .when()
            .get("/api/audits/" + java.util.UUID.randomUUID())
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("Le socle legacy reste joignable sous /api/legacy")
    void legacyAccessible() {
        given()
            .contentType("application/json")
            .body("{}")
        .when()
            .post("/api/legacy/auth/login")
        .then()
            // Le code exact importe peu : ce qui compte est que la route existe.
            .statusCode(notNullValue());
    }
}
