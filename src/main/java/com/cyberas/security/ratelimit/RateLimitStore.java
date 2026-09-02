package com.cyberas.security.ratelimit;

public interface RateLimitStore {
    void increment(String key, int windowSeconds);
    int getCount(String key);
    void reset(String key);
}
