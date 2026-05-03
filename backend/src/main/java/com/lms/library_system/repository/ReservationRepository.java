package com.lms.library_system.repository;

import com.lms.library_system.entity.Reservation;
import com.lms.library_system.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, ReservationStatus status);
    List<Reservation> findByUserIdOrderByReservedAtDesc(Long userId);
    List<Reservation> findByBookIdAndStatusOrderByReservedAtAsc(Long bookId, ReservationStatus status);
}
