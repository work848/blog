package com.blog.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class VerificationTokenService {

    public static final int CODE_EXPIRE_MINUTES = 10;

    public static final String TYPE_BIND_EMAIL = "bind_email";
    public static final String TYPE_FORGOT_PASSWORD = "forgot_password";

    private final Map<String, TokenEntry> tokenStore = new ConcurrentHashMap<>();

    public void saveCode(String email, String type, String code) {
        String key = buildKey(email, type);
        LocalDateTime expireAt = LocalDateTime.now().plusMinutes(CODE_EXPIRE_MINUTES);
        tokenStore.put(key, new TokenEntry(code, expireAt));
        log.info("Saved verification code for {} type={}, expireAt={}", email, type, expireAt);
    }

    public boolean validateCode(String email, String type, String code) {
        String key = buildKey(email, type);
        TokenEntry entry = tokenStore.get(key);
        if (entry == null) {
            log.warn("No verification code found for {} type={}", email, type);
            return false;
        }
        if (entry.expireAt.isBefore(LocalDateTime.now())) {
            tokenStore.remove(key);
            log.warn("Verification code expired for {} type={}", email, type);
            return false;
        }
        return entry.code.equals(code);
    }

    public void removeCode(String email, String type) {
        String key = buildKey(email, type);
        tokenStore.remove(key);
        log.info("Removed verification code for {} type={}", email, type);
    }

    public void cleanupExpiredTokens() {
        int removedCount = 0;
        LocalDateTime now = LocalDateTime.now();
        Iterator<Map.Entry<String, TokenEntry>> iterator = tokenStore.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, TokenEntry> entry = iterator.next();
            if (entry.getValue().expireAt.isBefore(now)) {
                iterator.remove();
                removedCount++;
            }
        }
        if (removedCount > 0) {
            log.info("Cleaned up {} expired verification tokens", removedCount);
        }
    }

    public int getTokenCount() {
        return tokenStore.size();
    }

    private String buildKey(String email, String type) {
        return type + ":" + email.toLowerCase();
    }

    private static class TokenEntry {
        final String code;
        final LocalDateTime expireAt;

        TokenEntry(String code, LocalDateTime expireAt) {
            this.code = code;
            this.expireAt = expireAt;
        }
    }
}
