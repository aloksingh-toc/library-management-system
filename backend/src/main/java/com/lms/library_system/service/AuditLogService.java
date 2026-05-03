package com.lms.library_system.service;

import com.lms.library_system.entity.AuditLog;
import com.lms.library_system.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(Long userId, String userEmail, String action, String details) {
        auditLogRepository.save(AuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .details(details)
                .build());
    }
}
