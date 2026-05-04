import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getAllBooks, searchBooks, getAllGenres, getBooksByGenre } from '../api/book.service';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import './Catalog.css';

const PAGE_SIZE = 12;

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBooks(activeQuery, activeGenre, page);
  }, [page, activeQuery, activeGenre]);

  const fetchBooks = async (q, genre, p) => {
    setLoading(true);
    try {
      let data;
      if (q) data = await searchBooks(q, p, PAGE_SIZE);
      else if (genre) data = await getBooksByGenre(genre, p, PAGE_SIZE);
      else data = await getAllBooks(p, PAGE_SIZE);
      setBooks(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch books', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveGenre('');
    setPage(0);
    setActiveQuery(query.trim());
  };

  const handleGenreSelect = (genre) => {
    setQuery('');
    setActiveQuery('');
    setPage(0);
    setActiveGenre(prev => prev === genre ? '' : genre);
  };

  const handleClear = () => {
    setQuery('');
    setActiveQuery('');
    setActiveGenre('');
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subtitle = activeQuery
    ? `${totalElements} result${totalElements !== 1 ? 's' : ''} for "${activeQuery}"`
    : activeGenre
    ? `${totalElements} book${totalElements !== 1 ? 's' : ''} in ${activeGenre}`
    : 'Discover your next great read';

  return (
    <div className="page-container container">
      <div className="catalog-header animate-fade-in">
        <div>
          <h1 className="page-title">Library Catalog</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>

        <form onSubmit={handleSearch} className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {(activeQuery || activeGenre) && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Clear
            </button>
          )}
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {genres.length > 0 && (
        <div className="genre-filter">
          {genres.map(g => (
            <button
              key={g}
              className={`genre-chip ${activeGenre === g ? 'active' : ''}`}
              onClick={() => handleGenreSelect(g)}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.length > 0 ? (
              books.map(book => <BookCard key={book.id} book={book} />)
            ) : (
              <div className="no-results glass-panel">
                <Search size={48} className="text-secondary mb-4" />
                <h3>No books found</h3>
                <p>Try adjusting your search or selecting a different genre</p>
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default Catalog;
