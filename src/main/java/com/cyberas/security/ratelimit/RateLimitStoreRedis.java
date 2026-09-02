package com.cyberas.security.ratelimit;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class RateLimitStoreRedis implements RateLimitStore {

    @Inject
    RedisDataSource redisDataSource;

    @Override
    public void increment(String key, int windowSeconds) {
        ValueCommands<String, Long> commands = redisDataSource.value(Long.class);
        String fullKey = "rate_limit:" + key;
        Long current = commands.get(fullKey);
        if (current == null) {
            commands.setex(fullKey, windowSeconds, 1L);
        } else {
            commands.incr(fullKey);
        }
    }

    @Override
    public int getCount(String key) {
        ValueCommands<String, Long> commands = redisDataSource.value(Long.class);
        String fullKey = "rate_limit:" + key;
        Long count = commands.get(fullKey);
        return count == null ? 0 : count.intValue();
    }

    @Override
    public void reset(String key) {
        redisDataSource.key().del("rate_limit:" + key);
    }
}
