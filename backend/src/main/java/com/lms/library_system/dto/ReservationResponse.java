package com.lms.library_system.dto;

import com.lms.library_system.entity.ReservationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReservationResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private ReservationStatus status;
    private LocalDateTime reservedAt;
}
