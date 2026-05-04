package com.lms.library_system.service;

import com.lms.library_system.dto.AdminStatsResponse;
import com.lms.library_system.dto.DailyStatResponse;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public List<DailyStatResponse> getDailyStats(int days) {
        LocalDate from = LocalDate.now().minusDays(days - 1);

        // Fetch raw counts from DB
        Map<LocalDate, Long> borrowMap = transactionRepository.countBorrowsByDateSince(from)
                .stream()
                .collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> (Long) row[1]
                ));

        Map<LocalDate, Long> returnMap = transactionRepository.countReturnsByDateSince(from)
                .stream()
                .collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> (Long) row[1]
                ));

        // Build a response for every day in the range
        List<DailyStatResponse> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = from.plusDays(i);
            result.add(new DailyStatResponse(
                    date.toString(),
                    borrowMap.getOrDefault(date, 0L),
                    returnMap.getOrDefault(date, 0L)
            ));
        }
        return result;
    }
}
