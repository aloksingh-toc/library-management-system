package com.lms.library_system.service;

import com.lms.library_system.entity.*;
import com.lms.library_system.exception.ApiException;
import com.lms.library_system.mapper.TransactionMapper;
import com.lms.library_system.repository.BookRepository;
import com.lms.library_system.repository.TransactionRepository;
import com.lms.library_system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock TransactionRepository transactionRepository;
    @Mock BookRepository bookRepository;
    @Mock UserRepository userRepository;
    @Mock TransactionMapper transactionMapper;
    @Mock AuditLogService auditLogService;
    @Mock ReservationService reservationService;

    @InjectMocks TransactionService transactionService;

    private User user;
    private Book book;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").role(Role.USER).build();
        book = Book.builder().id(1L).title("Test Book").availableCopies(2).totalCopies(3).build();
    }

    @Test
    void borrowBook_outOfStock_throwsBadRequest() {
        book.setAvailableCopies(0);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> transactionService.borrowBook(1L, 1L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("out of stock");
    }

    @Test
    void borrowBook_alreadyBorrowed_throwsConflict() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(transactionRepository.findByUserIdAndBookIdAndStatus(1L, 1L, TransactionStatus.BORROWED))
                .thenReturn(Optional.of(new Transaction()));

        assertThatThrownBy(() -> transactionService.borrowBook(1L, 1L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already borrowed");
    }

    @Test
    void borrowBook_bookNotFound_throwsNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.borrowBook(1L, 99L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void returnBook_noActiveRecord_throwsNotFound() {
        when(transactionRepository.findByUserIdAndBookIdAndStatus(1L, 1L, TransactionStatus.BORROWED))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.returnBook(1L, 1L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("No active borrow record");
    }
}
