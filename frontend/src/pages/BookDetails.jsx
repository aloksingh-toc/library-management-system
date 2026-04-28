import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById } from '../api/book.service';
import { borrowBook } from '../api/transaction.service';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, BookOpen, Calendar, Hash } from 'lucide-react';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

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

  return (
    <div className="page-container container animate-fade-in">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <button onClick={() => navigate(-1)} className="btn btn-secondary back-btn">
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      <div className="glass-panel book-details-card">
        <div className="book-details-body">
          <h1 className="page-title">{book.title}</h1>
          <p className="book-details-author">by {book.author}</p>

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
            className={`btn ${isAvailable ? 'btn-primary' : 'btn-secondary'} borrow-btn`}
            disabled={!isAvailable || borrowing}
          >
            {borrowing ? <div className="spinner"></div> : isAvailable ? 'Borrow Book' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
