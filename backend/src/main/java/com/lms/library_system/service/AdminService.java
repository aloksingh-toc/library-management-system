package com.lms.library_system.service;

import com.lms.library_system.dto.AdminStatsResponse;
import com.lms.library_system.dto.TransactionResponse;
import com.lms.library_system.entity.TransactionStatus;
import com.lms.library_system.mapper.TransactionMapper;
import com.lms.library_system.repository.BookRepository;
import com.lms.library_system.repository.TransactionRepository;
import com.lms.library_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .totalBooks(bookRepository.count())
                .totalUsers(userRepository.count())
                .activeLoans(transactionRepository.countByStatus(TransactionStatus.BORROWED))
                .overdueLoans(transactionRepository.countByStatus(TransactionStatus.OVERDUE))
                .totalTransactions(transactionRepository.count())
                .build();
    }

    public Page<TransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAllWithDetails(pageable)
                .map(transactionMapper::toResponse);
    }
}
