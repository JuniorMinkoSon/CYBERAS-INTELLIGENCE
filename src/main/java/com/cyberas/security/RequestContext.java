package com.cyberas.security;

public class RequestContext {
    private static final ThreadLocal<String> ipAddress = new ThreadLocal<>();
    private static final ThreadLocal<String> userAgent = new ThreadLocal<>();

    public static void setIpAddress(String ip) {
        ipAddress.set(ip);
    }

    public static String getIpAddress() {
        return ipAddress.get();
    }

    public static void setUserAgent(String ua) {
        userAgent.set(ua);
    }

    public static String getUserAgent() {
        return userAgent.get();
    }

    public static void clear() {
        ipAddress.remove();
        userAgent.remove();
    }
}
