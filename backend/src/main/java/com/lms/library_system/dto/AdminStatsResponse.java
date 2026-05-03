package com.lms.library_system.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalBooks;
    private long totalUsers;
    private long activeLoans;
    private long overdueLoans;
    private long totalTransactions;
}
