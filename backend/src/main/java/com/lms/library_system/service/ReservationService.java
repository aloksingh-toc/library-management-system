package com.lms.library_system.service;

import com.lms.library_system.dto.ReservationResponse;
import com.lms.library_system.entity.*;
import com.lms.library_system.exception.ApiException;
import com.lms.library_system.repository.BookRepository;
import com.lms.library_system.repository.ReservationRepository;
import com.lms.library_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReservationResponse reserve(Long userId, Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> ApiException.notFound("Book not found"));

        if (book.getAvailableCopies() > 0) {
            throw ApiException.badRequest("Book is available — borrow it directly instead of reserving");
        }

        reservationRepository.findByUserIdAndBookIdAndStatus(userId, bookId, ReservationStatus.PENDING)
                .ifPresent(r -> { throw ApiException.conflict("You already have a reservation for this book"); });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Reservation reservation = reservationRepository.save(
                Reservation.builder().user(user).book(book).build()
        );
        return toResponse(reservation);
    }

    @Transactional
    public void cancelReservation(Long userId, Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> ApiException.notFound("Reservation not found"));

        if (!reservation.getUser().getId().equals(userId)) {
            throw ApiException.badRequest("You can only cancel your own reservations");
        }
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw ApiException.badRequest("Only pending reservations can be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    public List<ReservationResponse> getMyReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByReservedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    // Called when a book is returned — fulfil the next pending reservation
    @Transactional
    public void fulfillNextReservation(Long bookId) {
        reservationRepository.findByBookIdAndStatusOrderByReservedAtAsc(bookId, ReservationStatus.PENDING)
                .stream().findFirst().ifPresent(r -> {
                    r.setStatus(ReservationStatus.FULFILLED);
                    reservationRepository.save(r);
                });
    }

    private ReservationResponse toResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .bookId(r.getBook().getId())
                .bookTitle(r.getBook().getTitle())
                .bookAuthor(r.getBook().getAuthor())
                .status(r.getStatus())
                .reservedAt(r.getReservedAt())
                .build();
    }
}
