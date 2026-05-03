package com.lms.library_system.service;

import com.lms.library_system.entity.TransactionStatus;
import com.lms.library_system.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class OverdueTrackingService {

    private final TransactionRepository transactionRepository;

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markOverdueTransactions() {
        transactionRepository.markOverdue(LocalDate.now(), TransactionStatus.BORROWED, TransactionStatus.OVERDUE);
    }
}
