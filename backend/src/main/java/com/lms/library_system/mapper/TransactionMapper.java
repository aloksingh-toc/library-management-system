package com.lms.library_system.mapper;

import com.lms.library_system.dto.TransactionResponse;
import com.lms.library_system.entity.Transaction;
import com.lms.library_system.entity.TransactionStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class TransactionMapper {

    private static final double FINE_PER_DAY = 1.0;

    public TransactionResponse toResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .userId(transaction.getUser().getId())
                .userEmail(transaction.getUser().getEmail())
                .bookId(transaction.getBook().getId())
                .bookTitle(transaction.getBook().getTitle())
                .bookAuthor(transaction.getBook().getAuthor())
                .borrowDate(transaction.getBorrowDate())
                .dueDate(transaction.getDueDate())
                .returnDate(transaction.getReturnDate())
                .status(transaction.getStatus())
                .fineAmount(calculateFine(transaction))
                .build();
    }

    private double calculateFine(Transaction transaction) {
        if (transaction.getStatus() == TransactionStatus.RETURNED) return 0;
        LocalDate compareDate = transaction.getReturnDate() != null
                ? transaction.getReturnDate()
                : LocalDate.now();
        long daysOverdue = ChronoUnit.DAYS.between(transaction.getDueDate(), compareDate);
        return daysOverdue > 0 ? daysOverdue * FINE_PER_DAY : 0;
    }
}
