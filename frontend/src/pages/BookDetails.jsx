import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById } from '../api/book.service';
import { borrowBook } from '../api/transaction.service';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, BookOpen, Calendar, Hash, Bell, Tag } from 'lucide-react';
import { reserveBook } from '../api/reservation.service';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    getBookById(id)
      .then(setBook)
      .catch(() => addToast('Failed to load book details.', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBorrow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setBorrowing(true);
    try {
      await borrowBook(id);
      addToast('Book borrowed successfully! Due in 14 days.', 'success');
      setBook(prev => ({ ...prev, availableCopies: prev.availableCopies - 1 }));
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to borrow book.', 'error');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!book) return <div className="page-container container"><h2>Book not found</h2></div>;

  const isAvailable = book.availableCopies > 0;

  const handleReserve = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setReserving(true);
    try {
      await reserveBook(id);
      addToast('Reserved! You will be notified when this book becomes available.', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to reserve book.', 'error');
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="page-container container animate-fade-in">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <button onClick={() => navigate(-1)} className="btn btn-secondary back-btn">
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      <div className="glass-panel book-details-card">
        <div className="book-details-layout">
          {book.coverUrl && (
            <div className="book-details-cover">
              <img src={book.coverUrl} alt={`Cover of ${book.title}`} className="details-cover-img" />
            </div>
          )}
        <div className="book-details-content">
        <div className="book-details-body">
          <h1 className="page-title">{book.title}</h1>
          <p className="book-details-author">by {book.author}</p>
          {book.genre && (
            <span className="book-genre-tag"><Tag size={13} /> {book.genre}</span>
          )}

          <div className="book-details-description">
            <h3>Description</h3>
            <p>{book.description || 'No description available for this book.'}</p>
          </div>

          <div className="book-details-meta">
            <div className="meta-item">
              <Hash size={18} className="meta-icon" />
              <div>
                <div className="meta-label">ISBN</div>
                <div className="meta-value">{book.isbn}</div>
              </div>
            </div>
            <div className="meta-item">
              <Calendar size={18} className="meta-icon" />
              <div>
                <div className="meta-label">Published</div>
                <div className="meta-value">{book.publishedYear || 'Unknown'}</div>
              </div>
            </div>
            <div className="meta-item">
              <BookOpen size={18} className="meta-icon" />
              <div>
                <div className="meta-label">Total Copies</div>
                <div className="meta-value">{book.totalCopies}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="book-details-actions">
          <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'} status-badge-lg`}>
            {book.availableCopies} Available
          </span>
          <button
            onClick={handleBorrow}
            className="btn btn-primary borrow-btn"
            disabled={!isAvailable || borrowing}
          >
            {borrowing ? <div className="spinner"></div> : 'Borrow Book'}
          </button>
          {!isAvailable && (
            <button onClick={handleReserve} className="btn btn-secondary borrow-btn" disabled={reserving}>
              {reserving ? <div className="spinner"></div> : <><Bell size={16} /> Reserve</>}
            </button>
          )}
        </div>
        </div> {/* end book-details-content */}
        </div> {/* end book-details-layout */}
      </div>
    </div>
  );
};

export default BookDetails;
