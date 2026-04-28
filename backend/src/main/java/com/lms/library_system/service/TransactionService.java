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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

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

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Transaction transaction = Transaction.builder()
                .user(user)
                .book(book)
                .borrowDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .status(TransactionStatus.BORROWED)
                .build();

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    public TransactionResponse returnBook(Long userId, Long bookId) {
        Transaction transaction = transactionRepository
                .findByUserIdAndBookIdAndStatus(userId, bookId, TransactionStatus.BORROWED)
                .orElseThrow(() -> ApiException.notFound("No active borrow record found for this book"));

        transaction.setStatus(TransactionStatus.RETURNED);
        transaction.setReturnDate(LocalDate.now());

        Book book = transaction.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);

        bookRepository.save(book);
        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    public Page<TransactionResponse> getUserTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable)
                .map(transactionMapper::toResponse);
    }
}
