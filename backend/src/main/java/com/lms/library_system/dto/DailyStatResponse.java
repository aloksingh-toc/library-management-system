package com.lms.library_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DailyStatResponse {
    private String date;
    private long borrows;
    private long returns;
}
