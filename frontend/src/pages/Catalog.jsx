import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllBooks, searchBooks } from '../api/book.service';
import BookCard from '../components/BookCard';
import './Catalog.css';

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getAllBooks(0, 50);
      setBooks(data.content || []);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      fetchBooks();
      return;
    }
    setLoading(true);
    try {
      const data = await searchBooks(query, 0, 50);
      setBooks(data.content || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container">
      <div className="catalog-header animate-fade-in">
        <div>
          <h1 className="page-title">Library Catalog</h1>
          <p className="page-subtitle">Discover your next great read</p>
        </div>
        
        <form onSubmit={handleSearch} className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by title, author, or ISBN..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="books-grid">
          {books.length > 0 ? (
            books.map(book => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <div className="no-results glass-panel">
              <Search size={48} className="text-secondary mb-4" />
              <h3>No books found</h3>
              <p>Try adjusting your search query</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Catalog;
