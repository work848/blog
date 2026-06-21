package com.blog.config;

import com.blog.service.VerificationTokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ScheduledTasks {

    @Autowired
    private VerificationTokenService verificationTokenService;

    @Scheduled(fixedRate = 60000, initialDelay = 60000)
    public void cleanupExpiredVerificationTokens() {
        log.debug("Starting scheduled cleanup of expired verification tokens. Current count: {}",
                verificationTokenService.getTokenCount());
        verificationTokenService.cleanupExpiredTokens();
        log.debug("Scheduled cleanup completed. Remaining count: {}",
                verificationTokenService.getTokenCount());
    }
}
