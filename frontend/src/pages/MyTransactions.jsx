import React, { useState, useEffect } from 'react';
import { getMyHistory, returnBook } from '../api/transaction.service';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { TRANSACTION_STATUS } from '../constants';
import { BookOpen, Calendar, Clock, CheckCircle } from 'lucide-react';
import './MyTransactions.css';

const MyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const data = await getMyHistory(0, 50);
      setTransactions(data.content || []);
    } catch (error) {
      addToast('Failed to load borrowing history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (bookId, transactionId) => {
    setReturningId(transactionId);
    try {
      await returnBook(bookId);
      addToast('Book returned successfully!', 'success');
      await fetchHistory();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to return book.', 'error');
    } finally {
      setReturningId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container container animate-fade-in">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="catalog-header">
        <div>
          <h1 className="page-title">My Books</h1>
          <p className="page-subtitle">Your borrowing history and active loans</p>
        </div>
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="no-results glass-panel">
            <BookOpen size={48} />
            <h3>No borrowing history</h3>
            <p>You haven't borrowed any books yet.</p>
          </div>
        ) : (
          transactions.map(t => {
            const isReturned = t.status === TRANSACTION_STATUS.RETURNED;
            const isLate = !isReturned && new Date(t.dueDate) < new Date();

            return (
              <div
                key={t.id}
                className={`transaction-card glass-panel ${isReturned ? 'status-returned' : isLate ? 'status-late' : 'status-active'}`}
              >
                <div className="transaction-info">
                  <h3 className="transaction-title">{t.bookTitle}</h3>
                  <p className="transaction-author">by {t.bookAuthor}</p>
                  <div className="transaction-dates">
                    <div className="date-item">
                      <Calendar size={15} />
                      <span>Borrowed: {t.borrowDate}</span>
                    </div>
                    <div className={`date-item ${isLate ? 'date-late' : ''}`}>
                      <Clock size={15} />
                      <span>Due: {t.dueDate}</span>
                    </div>
                    {isReturned && (
                      <div className="date-item date-returned">
                        <CheckCircle size={15} />
                        <span>Returned: {t.returnDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="transaction-action">
                  {!isReturned ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleReturn(t.bookId, t.id)}
                      disabled={returningId === t.id}
                    >
                      {returningId === t.id ? <div className="spinner"></div> : 'Return Book'}
                    </button>
                  ) : (
                    <span className="status-badge available">Returned</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyTransactions;
