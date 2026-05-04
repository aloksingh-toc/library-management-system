package com.lms.library_system.service;

import com.lms.library_system.entity.TransactionStatus;
import com.lms.library_system.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OverdueTrackingService {

    private final TransactionRepository transactionRepository;
    private final EmailService emailService;

    private static final double FINE_PER_DAY = 1.0;

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markOverdueTransactions() {
        LocalDate today = LocalDate.now();

        // Mark newly overdue
        transactionRepository.markOverdue(today, TransactionStatus.BORROWED, TransactionStatus.OVERDUE);

        // Send reminders for all already-overdue transactions
        transactionRepository.findByStatus(TransactionStatus.OVERDUE)
                .forEach(t -> {
                    long daysOverdue = ChronoUnit.DAYS.between(t.getDueDate(), today);
                    double fine = daysOverdue * FINE_PER_DAY;
                    emailService.sendOverdueReminder(
                            t.getUser().getEmail(),
                            t.getBook().getTitle(),
                            daysOverdue,
                            fine
                    );
                });
    }
}
