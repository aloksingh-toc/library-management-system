package com.lms.library_system.controller;

import com.lms.library_system.dto.TransactionResponse;
import com.lms.library_system.entity.User;
import com.lms.library_system.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/borrow/{bookId}")
    public ResponseEntity<TransactionResponse> borrowBook(
            @PathVariable Long bookId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(transactionService.borrowBook(user.getId(), bookId));
    }

    @PostMapping("/return/{bookId}")
    public ResponseEntity<TransactionResponse> returnBook(
            @PathVariable Long bookId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(transactionService.returnBook(user.getId(), bookId));
    }

    @GetMapping("/my-history")
    public ResponseEntity<Page<TransactionResponse>> getMyHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getUserTransactions(user.getId(), pageable));
    }
}
