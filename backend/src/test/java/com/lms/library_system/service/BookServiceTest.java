package com.lms.library_system.service;

import com.lms.library_system.dto.BookRequest;
import com.lms.library_system.dto.BookResponse;
import com.lms.library_system.entity.Book;
import com.lms.library_system.exception.ApiException;
import com.lms.library_system.mapper.BookMapper;
import com.lms.library_system.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock BookRepository bookRepository;
    @Mock BookMapper bookMapper;

    @InjectMocks BookService bookService;

    private BookRequest request;
    private Book book;
    private BookResponse response;

    @BeforeEach
    void setUp() {
        request = BookRequest.builder()
                .title("Clean Code")
                .author("Robert Martin")
                .isbn("9780132350884")
                .totalCopies(3)
                .build();

        book = Book.builder()
                .id(1L)
                .title("Clean Code")
                .author("Robert Martin")
                .isbn("9780132350884")
                .totalCopies(3)
                .availableCopies(3)
                .build();

        response = new BookResponse();
        response.setId(1L);
        response.setTitle("Clean Code");
    }

    @Test
    void addBook_success() {
        when(bookRepository.existsByIsbn(request.getIsbn())).thenReturn(false);
        when(bookRepository.save(any())).thenReturn(book);
        when(bookMapper.toResponse(book)).thenReturn(response);

        BookResponse result = bookService.addBook(request);

        assertThat(result.getTitle()).isEqualTo("Clean Code");
        verify(bookRepository).save(any(Book.class));
    }

    @Test
    void addBook_duplicateIsbn_throwsConflict() {
        when(bookRepository.existsByIsbn(request.getIsbn())).thenReturn(true);

        assertThatThrownBy(() -> bookService.addBook(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void getBookById_notFound_throwsNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getBookById(99L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void deleteBook_notFound_throwsNotFound() {
        when(bookRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> bookService.deleteBook(99L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void updateBook_reducingBelowBorrowed_throwsBadRequest() {
        book.setAvailableCopies(1);
        book.setTotalCopies(3);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        BookRequest reduceRequest = BookRequest.builder()
                .title("Clean Code").author("Robert Martin")
                .isbn("9780132350884").totalCopies(1).build();

        assertThatThrownBy(() -> bookService.updateBook(1L, reduceRequest))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Cannot reduce");
    }
}
