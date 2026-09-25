package com.cyberas.api;

import com.cyberas.security.ratelimit.RateLimitStore;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
class RateLimitTest {

    /**
     * Mot de passe volontairement faux, mais assez long pour être examiné.
     *
     * Le DTO de connexion impose huit caractères minimum. Le mot « wrong »,
     * qu'utilisait ce test, n'en a que cinq : la validation le rejetait en 400
     * avant que la ressource ne soit appelée, et le test attendait un 401 qui
     * ne pouvait jamais venir. Il ne testait donc pas ce qu'il croyait tester,
     * et ne le disait pas, n'ayant jamais été exécuté.
     */
    private static final String MAUVAIS_MOT_DE_PASSE = "mauvais-mot-de-passe";

    @Inject
    RateLimitStore rateLimitStore;

    /**
     * Les compteurs sont remis à zéro avant chaque test.
     *
     * Ils vivent dans Redis, hors du cycle de vie de JUnit : sans cette remise
     * à zéro, un test qui épuise le quota d'inscription le laisse épuisé pour
     * le suivant, et l'ordre d'exécution décide du résultat. C'est ce qui
     * faisait échouer testRegisterUnderLimit sur un 429 alors qu'il attendait
     * une inscription acceptée.
     *
     * Les deux formes de l'adresse locale sont visées : selon la pile réseau,
     * le serveur voit la boucle locale en IPv4 ou en IPv6.
     */
    @BeforeEach
    void setUp() {
        for (String ip : new String[] { "127.0.0.1", "0:0:0:0:0:0:0:1", "::1" }) {
            rateLimitStore.reset("login:" + ip);
            rateLimitStore.reset("register:" + ip);
        }
    }

    @Test
    void testLoginUnderLimit() {
        for (int i = 0; i < 3; i++) {
            given()
                .contentType("application/json")
                .body("{\"email\":\"test@example.com\",\"password\":\"" + MAUVAIS_MOT_DE_PASSE + "\"}")
                .post("/api/auth/login")
                .then()
                .statusCode(401);
        }
    }

    @Test
    void testLoginExceedsLimit() {
        for (int i = 0; i < 5; i++) {
            given()
                .contentType("application/json")
                .body("{\"email\":\"test@example.com\",\"password\":\"" + MAUVAIS_MOT_DE_PASSE + "\"}")
                .post("/api/auth/login")
                .then()
                .statusCode(401);
        }
        given()
            .contentType("application/json")
            .body("{\"email\":\"test@example.com\",\"password\":\"" + MAUVAIS_MOT_DE_PASSE + "\"}")
            .post("/api/auth/login")
            .then()
            .statusCode(429)
            .body("error", equalTo("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    void testRegisterUnderLimit() {
        given()
            .contentType("application/json")
            .body("{\"organizationName\":\"Test Org\",\"email\":\"newuser@test.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}")
            .post("/api/auth/register")
            .then()
            .statusCode(201);
    }

    @Test
    void testRegisterExceedsLimit() {
        for (int i = 0; i < 3; i++) {
            given()
                .contentType("application/json")
                .body("{\"organizationName\":\"Test Org " + i + "\",\"email\":\"newuser" + i + "@test.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}")
                .post("/api/auth/register")
                .then()
                .statusCode(201);
        }
        given()
            .contentType("application/json")
            .body("{\"organizationName\":\"Test Org 4\",\"email\":\"newuser4@test.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}")
            .post("/api/auth/register")
            .then()
            .statusCode(429)
            .body("error", equalTo("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    void testCorsOptionsNotBlocked() {
        given()
            .header("Origin", "http://localhost:5173")
            .options("/api/auth/login")
            .then()
            .statusCode(204);
    }
}
