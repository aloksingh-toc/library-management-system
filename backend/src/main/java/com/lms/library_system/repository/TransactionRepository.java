package com.lms.library_system.repository;

import com.lms.library_system.entity.Transaction;
import com.lms.library_system.entity.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
    List<Transaction> findByUserIdAndStatus(Long userId, TransactionStatus status);
    Optional<Transaction> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, TransactionStatus status);
    long countByStatus(TransactionStatus status);
}
