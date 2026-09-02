package com.cyberas.security.ratelimit;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.inject.Inject;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class RateLimitServiceTest {

    @Inject
    RateLimitService rateLimitService;

    @Inject
    RateLimitStore rateLimitStore;

    @BeforeEach
    void setUp() {
        rateLimitStore.reset("login:127.0.0.1");
        rateLimitStore.reset("login:192.168.1.1");
        rateLimitStore.reset("register:127.0.0.1");
        rateLimitStore.reset("register:192.168.1.1");
    }

    @Test
    void testLoginUnderLimit() {
        String ip = "127.0.0.1";
        assertTrue(rateLimitService.isLoginAllowed(ip));
        assertTrue(rateLimitService.isLoginAllowed(ip));
        assertTrue(rateLimitService.isLoginAllowed(ip));
    }

    @Test
    void testLoginAtLimit() {
        String ip = "127.0.0.1";
        for (int i = 0; i < 5; i++) {
            assertTrue(rateLimitService.isLoginAllowed(ip));
        }
        assertFalse(rateLimitService.isLoginAllowed(ip));
    }

    @Test
    void testLoginIndependentByIp() {
        String ip1 = "127.0.0.1";
        String ip2 = "192.168.1.1";
        for (int i = 0; i < 5; i++) {
            assertTrue(rateLimitService.isLoginAllowed(ip1));
        }
        assertFalse(rateLimitService.isLoginAllowed(ip1));
        assertTrue(rateLimitService.isLoginAllowed(ip2));
    }

    @Test
    void testRegisterUnderLimit() {
        String ip = "127.0.0.1";
        assertTrue(rateLimitService.isRegisterAllowed(ip));
        assertTrue(rateLimitService.isRegisterAllowed(ip));
    }

    @Test
    void testRegisterAtLimit() {
        String ip = "127.0.0.1";
        assertTrue(rateLimitService.isRegisterAllowed(ip));
        assertTrue(rateLimitService.isRegisterAllowed(ip));
        assertTrue(rateLimitService.isRegisterAllowed(ip));
        assertFalse(rateLimitService.isRegisterAllowed(ip));
    }

    @Test
    void testCounterIncrement() {
        String key = "test:key";
        rateLimitStore.reset(key);

        assertEquals(0, rateLimitStore.getCount(key));
        rateLimitStore.increment(key, 60);
        assertEquals(1, rateLimitStore.getCount(key));
        rateLimitStore.increment(key, 60);
        assertEquals(2, rateLimitStore.getCount(key));
    }
}
