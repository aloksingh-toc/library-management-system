package com.lms.library_system.mapper;

import com.lms.library_system.dto.TransactionResponse;
import com.lms.library_system.entity.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class TransactionMapperTest {

    private final TransactionMapper mapper = new TransactionMapper();

    private Transaction buildTransaction(LocalDate dueDate, TransactionStatus status, LocalDate returnDate) {
        User user = User.builder().id(1L).email("user@test.com").role(Role.USER).build();
        Book book = Book.builder().id(1L).title("Test").author("Author").isbn("1234567890").build();
        return Transaction.builder()
                .id(1L).user(user).book(book)
                .borrowDate(dueDate.minusDays(14))
                .dueDate(dueDate).status(status).returnDate(returnDate)
                .build();
    }

    @Test
    void fine_isZero_whenNotOverdue() {
        Transaction t = buildTransaction(LocalDate.now().plusDays(5), TransactionStatus.BORROWED, null);
        TransactionResponse r = mapper.toResponse(t);
        assertThat(r.getFineAmount()).isEqualTo(0);
    }

    @Test
    void fine_isCalculated_whenOverdue() {
        Transaction t = buildTransaction(LocalDate.now().minusDays(3), TransactionStatus.OVERDUE, null);
        TransactionResponse r = mapper.toResponse(t);
        assertThat(r.getFineAmount()).isEqualTo(3.0);
    }

    @Test
    void fine_isZero_whenReturned() {
        Transaction t = buildTransaction(LocalDate.now().minusDays(5), TransactionStatus.RETURNED,
                LocalDate.now().minusDays(2));
        TransactionResponse r = mapper.toResponse(t);
        assertThat(r.getFineAmount()).isEqualTo(0);
    }
}
