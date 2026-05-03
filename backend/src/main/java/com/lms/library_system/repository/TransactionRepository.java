package com.lms.library_system.repository;

import com.lms.library_system.entity.Transaction;
import com.lms.library_system.entity.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t JOIN FETCH t.user JOIN FETCH t.book WHERE t.user.id = :userId")
    Page<Transaction> findByUserId(@Param("userId") Long userId, Pageable pageable);

    List<Transaction> findByUserIdAndStatus(Long userId, TransactionStatus status);
    Optional<Transaction> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, TransactionStatus status);
    long countByStatus(TransactionStatus status);

    @Query("SELECT t FROM Transaction t JOIN FETCH t.user JOIN FETCH t.book")
    Page<Transaction> findAllWithDetails(Pageable pageable);

    @Modifying
    @Query("UPDATE Transaction t SET t.status = :overdue WHERE t.dueDate < :today AND t.status = :borrowed")
    void markOverdue(@Param("today") LocalDate today,
                     @Param("borrowed") TransactionStatus borrowed,
                     @Param("overdue") TransactionStatus overdue);
}
