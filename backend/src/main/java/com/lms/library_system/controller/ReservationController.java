package com.lms.library_system.controller;

import com.lms.library_system.dto.ReservationResponse;
import com.lms.library_system.entity.User;
import com.lms.library_system.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/{bookId}")
    public ResponseEntity<ReservationResponse> reserve(
            @PathVariable Long bookId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(reservationService.reserve(user.getId(), bookId));
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal User user
    ) {
        reservationService.cancelReservation(user.getId(), reservationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reservationService.getMyReservations(user.getId()));
    }
}
