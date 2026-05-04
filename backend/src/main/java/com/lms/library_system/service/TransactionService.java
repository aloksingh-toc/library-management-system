package com.lms.library_system.service;

import com.lms.library_system.dto.TransactionResponse;
import com.lms.library_system.entity.Book;
import com.lms.library_system.entity.Transaction;
import com.lms.library_system.entity.TransactionStatus;
import com.lms.library_system.entity.User;
import com.lms.library_system.exception.ApiException;
import com.lms.library_system.mapper.TransactionMapper;
import com.lms.library_system.repository.BookRepository;
import com.lms.library_system.repository.TransactionRepository;
import com.lms.library_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null") // Spring Data JPA methods lack null annotations; safe by contract
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;
    private final AuditLogService auditLogService;
    private final ReservationService reservationService;
    private final EmailService emailService;

    @Transactional
    public TransactionResponse borrowBook(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> ApiException.notFound("Book not found with id: " + bookId));

        if (book.getAvailableCopies() <= 0) {
            throw ApiException.badRequest("'" + book.getTitle() + "' is currently out of stock");
        }

        transactionRepository.findByUserIdAndBookIdAndStatus(userId, bookId, TransactionStatus.BORROWED)
                .ifPresent(t -> {
                    throw ApiException.conflict("You have already borrowed this book");
                });

        try {
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.saveAndFlush(book);
        } catch (OptimisticLockingFailureException e) {
            throw ApiException.conflict("Another request processed this book simultaneously. Please try again.");
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .book(book)
                .borrowDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .status(TransactionStatus.BORROWED)
                .build();

        TransactionResponse response = transactionMapper.toResponse(transactionRepository.save(transaction));
        auditLogService.log(userId, user.getEmail(), "BOOK_BORROWED",
                "Book: " + book.getTitle() + " (id=" + bookId + ")");
        emailService.sendBorrowConfirmation(user.getEmail(), book.getTitle(), transaction.getDueDate().toString());
        return response;
    }

    @Transactional
    public TransactionResponse returnBook(Long userId, Long bookId) {
        Transaction transaction = transactionRepository
                .findByUserIdAndBookIdAndStatus(userId, bookId, TransactionStatus.BORROWED)
                .orElseThrow(() -> ApiException.notFound("No active borrow record found for this book"));

        transaction.setStatus(TransactionStatus.RETURNED);
        transaction.setReturnDate(LocalDate.now());

        Book book = transaction.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);

        bookRepository.save(book);
        TransactionResponse response = transactionMapper.toResponse(transactionRepository.save(transaction));
        auditLogService.log(userId, transaction.getUser().getEmail(), "BOOK_RETURNED",
                "Book: " + book.getTitle() + " (id=" + bookId + ")");
        reservationService.fulfillNextReservation(bookId);
        return response;
    }

    public Page<TransactionResponse> getUserTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable)
                .map(transactionMapper::toResponse);
    }
}
