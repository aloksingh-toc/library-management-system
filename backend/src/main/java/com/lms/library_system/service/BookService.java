package com.lms.library_system.service;

import com.lms.library_system.dto.BookRequest;
import com.lms.library_system.dto.BookResponse;
import com.lms.library_system.entity.Book;
import com.lms.library_system.exception.ApiException;
import com.lms.library_system.mapper.BookMapper;
import com.lms.library_system.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null") // Spring Data JPA methods lack null annotations; safe by contract
public class BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;

    public Page<BookResponse> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable).map(bookMapper::toResponse);
    }

    public Page<BookResponse> searchBooks(String query, Pageable pageable) {
        return bookRepository.searchBooks(query, pageable).map(bookMapper::toResponse);
    }

    public BookResponse getBookById(Long id) {
        return bookRepository.findById(id)
                .map(bookMapper::toResponse)
                .orElseThrow(() -> ApiException.notFound("Book not found with id: " + id));
    }

    public BookResponse addBook(BookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw ApiException.conflict("A book with ISBN '" + request.getIsbn() + "' already exists");
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .description(request.getDescription())
                .publishedYear(request.getPublishedYear())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .build();

        return bookMapper.toResponse(bookRepository.save(book));
    }

    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Book not found with id: " + id));

        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw ApiException.conflict("Another book with ISBN '" + request.getIsbn() + "' already exists");
        }

        int copiesDiff = request.getTotalCopies() - book.getTotalCopies();
        int newAvailable = book.getAvailableCopies() + copiesDiff;

        if (newAvailable < 0) {
            throw ApiException.badRequest("Cannot reduce total copies below the currently borrowed amount");
        }

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setDescription(request.getDescription());
        book.setPublishedYear(request.getPublishedYear());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(newAvailable);

        return bookMapper.toResponse(bookRepository.save(book));
    }

    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw ApiException.notFound("Book not found with id: " + id);
        }
        bookRepository.deleteById(id);
    }
}
