package com.lms.library_system.mapper;

import com.lms.library_system.dto.TransactionResponse;
import com.lms.library_system.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

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
                .build();
    }
}
