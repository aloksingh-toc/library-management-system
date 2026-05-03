import React, { useState, useEffect } from 'react';
import { getMyHistory, returnBook } from '../api/transaction.service';
import { getMyReservations, cancelReservation } from '../api/reservation.service';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { TRANSACTION_STATUS } from '../constants';
import { BookOpen, Calendar, Clock, CheckCircle, Bell, X } from 'lucide-react';
import './MyTransactions.css';

const MyTransactions = () => {
  const [tab, setTab] = useState('loans');
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { fetchHistory(); fetchReservations(); }, []);

  const fetchHistory = async () => {
    try {
      const data = await getMyHistory(0, 50);
      setTransactions(data.content || []);
    } catch {
      addToast('Failed to load borrowing history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch {
      addToast('Failed to load reservations.', 'error');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    setCancellingId(reservationId);
    try {
      await cancelReservation(reservationId);
      addToast('Reservation cancelled.', 'success');
      fetchReservations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel reservation.', 'error');
    } finally {
      setCancellingId(null);
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

      <div className="admin-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`admin-tab ${tab === 'loans' ? 'active' : ''}`} onClick={() => setTab('loans')}>
          <BookOpen size={16} /> Loans
        </button>
        <button className={`admin-tab ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>
          <Bell size={16} /> Reservations {reservations.filter(r => r.status === 'PENDING').length > 0 && `(${reservations.filter(r => r.status === 'PENDING').length})`}
        </button>
      </div>

      {tab === 'reservations' && (
        <div className="transactions-list">
          {reservations.length === 0 ? (
            <div className="no-results glass-panel">
              <Bell size={48} />
              <h3>No reservations</h3>
              <p>Reserve a book when it is out of stock.</p>
            </div>
          ) : reservations.map(r => (
            <div key={r.id} className={`transaction-card glass-panel ${r.status === 'PENDING' ? 'status-active' : r.status === 'FULFILLED' ? 'status-returned' : ''}`}>
              <div className="transaction-info">
                <h3 className="transaction-title">{r.bookTitle}</h3>
                <p className="transaction-author">by {r.bookAuthor}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Reserved: {new Date(r.reservedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="transaction-action">
                {r.status === 'PENDING' ? (
                  <button className="btn btn-danger" onClick={() => handleCancelReservation(r.id)} disabled={cancellingId === r.id}>
                    {cancellingId === r.id ? <div className="spinner" /> : <><X size={14} /> Cancel</>}
                  </button>
                ) : (
                  <span className={`status-badge ${r.status === 'FULFILLED' ? 'available' : ''}`}>{r.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'loans' && <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="no-results glass-panel">
            <BookOpen size={48} />
            <h3>No borrowing history</h3>
            <p>You haven't borrowed any books yet.</p>
          </div>
        ) : (
          transactions.map(t => {
            const isReturned = t.status === TRANSACTION_STATUS.RETURNED;
            const isOverdue = t.status === TRANSACTION_STATUS.OVERDUE;
            const isLate = !isReturned && new Date(t.dueDate) < new Date();

            return (
              <div
                key={t.id}
                className={`transaction-card glass-panel ${isReturned ? 'status-returned' : (isOverdue || isLate) ? 'status-late' : 'status-active'}`}
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
                  {(isOverdue || isLate) && t.fineAmount > 0 && (
                    <div className="fine-badge">Fine: ${t.fineAmount.toFixed(2)}</div>
                  )}
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
      </div>}
    </div>
  );
};

export default MyTransactions;
