package com.cyberas.api;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
class RateLimitIT {

    @BeforeEach
    void setUp() {
        RestAssured.baseURI = "http://localhost:8080";
    }

    @Test
    void testLoginUnderLimit() {
        for (int i = 0; i < 3; i++) {
            given()
                .contentType("application/json")
                .body("{\"email\":\"test@example.com\",\"password\":\"wrong\"}")
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
                .body("{\"email\":\"test@example.com\",\"password\":\"wrong\"}")
                .post("/api/auth/login")
                .then()
                .statusCode(401);
        }
        given()
            .contentType("application/json")
            .body("{\"email\":\"test@example.com\",\"password\":\"wrong\"}")
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
