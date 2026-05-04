import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllTransactions, adminAddBook, adminUpdateBook, adminDeleteBook, getActivityChart } from '../api/admin.service';
import { getAllBooks } from '../api/book.service';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart2, BookOpen, Users, AlertCircle, RefreshCw, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { TRANSACTION_STATUS } from '../constants';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import './AdminDashboard.css';

const EMPTY_BOOK = { title: '', author: '', isbn: '', description: '', genre: '', coverUrl: '', publishedYear: '', totalCopies: 1 };

const AdminDashboard = () => {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartDays, setChartDays] = useState(30);
  const [chartLoading, setChartLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookForm, setBookForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { fetchStats(); fetchChart(chartDays); }, []);
  useEffect(() => {
    if (tab === 'transactions') fetchTransactions();
    if (tab === 'books') fetchBooks();
  }, [tab]);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      addToast('Failed to load stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchChart = async (days) => {
    setChartLoading(true);
    try {
      const data = await getActivityChart(days);
      // Format dates to be shorter for the x-axis
      setChartData(data.map(d => ({ ...d, date: d.date.slice(5) }))); // "MM-DD"
    } catch {
      addToast('Failed to load chart data.', 'error');
    } finally {
      setChartLoading(false);
    }
  };

  const handleChartDaysChange = (days) => {
    setChartDays(days);
    fetchChart(days);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllTransactions(0, 50);
      setTransactions(data.content || []);
    } catch {
      addToast('Failed to load transactions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getAllBooks(0, 100);
      setBooks(data.content || []);
    } catch {
      addToast('Failed to load books.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...bookForm, publishedYear: bookForm.publishedYear ? parseInt(bookForm.publishedYear) : null, totalCopies: parseInt(bookForm.totalCopies) };
      if (editingId) {
        await adminUpdateBook(editingId, payload);
        addToast('Book updated successfully.', 'success');
      } else {
        await adminAddBook(payload);
        addToast('Book added successfully.', 'success');
      }
      setBookForm(null);
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save book.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminDeleteBook(id);
      addToast('Book deleted.', 'success');
      fetchBooks();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete book.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (book) => {
    setEditingId(book.id);
    setBookForm({ title: book.title, author: book.author, isbn: book.isbn, description: book.description || '', genre: book.genre || '', coverUrl: book.coverUrl || '', publishedYear: book.publishedYear || '', totalCopies: book.totalCopies });
  };

  const statusClass = (status) => {
    if (status === TRANSACTION_STATUS.RETURNED) return 'status-returned';
    if (status === TRANSACTION_STATUS.OVERDUE) return 'status-late';
    return 'status-active';
  };

  if (loading && tab === 'stats') return <LoadingSpinner />;

  return (
    <div className="page-container container animate-fade-in">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="catalog-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage the library system</p>
        </div>
      </div>

      <div className="admin-tabs">
        {[['stats', BarChart2, 'Overview'], ['books', BookOpen, 'Books'], ['transactions', RefreshCw, 'Transactions']].map(([key, Icon, label]) => (
          <button key={key} className={`admin-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <BookOpen size={28} className="stat-icon" />
              <div className="stat-value">{stats.totalBooks}</div>
              <div className="stat-label">Total Books</div>
            </div>
            <div className="stat-card glass-panel">
              <Users size={28} className="stat-icon" />
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Registered Users</div>
            </div>
            <div className="stat-card glass-panel">
              <RefreshCw size={28} className="stat-icon stat-active" />
              <div className="stat-value">{stats.activeLoans}</div>
              <div className="stat-label">Active Loans</div>
            </div>
            <div className="stat-card glass-panel">
              <AlertCircle size={28} className="stat-icon stat-danger" />
              <div className="stat-value">{stats.overdueLoans}</div>
              <div className="stat-label">Overdue Loans</div>
            </div>
            <div className="stat-card glass-panel">
              <BarChart2 size={28} className="stat-icon" />
              <div className="stat-value">{stats.totalTransactions}</div>
              <div className="stat-label">Total Transactions</div>
            </div>
          </div>

          <div className="chart-panel glass-panel">
            <div className="chart-header">
              <h3 className="chart-title">Library Activity</h3>
              <div className="chart-range-btns">
                {[7, 14, 30, 60].map(d => (
                  <button
                    key={d}
                    className={`chart-range-btn ${chartDays === d ? 'active' : ''}`}
                    onClick={() => handleChartDaysChange(d)}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            {chartLoading ? (
              <div className="chart-loading"><div className="spinner" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success, #22c55e)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--success, #22c55e)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickLine={false}
                    axisLine={false}
                    interval={chartDays <= 14 ? 0 : Math.floor(chartDays / 10)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="borrows"
                    name="Borrows"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#colorBorrows)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    name="Returns"
                    stroke="var(--success, #22c55e)"
                    strokeWidth={2}
                    fill="url(#colorReturns)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {tab === 'books' && (
        <div>
          <div className="admin-actions">
            <button className="btn btn-primary" onClick={() => { setBookForm(EMPTY_BOOK); setEditingId(null); }}>
              <Plus size={16} /> Add Book
            </button>
          </div>

          {bookForm && (
            <form className="book-form glass-panel" onSubmit={handleBookSubmit}>
              <h3>{editingId ? 'Edit Book' : 'Add New Book'}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-control" required value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input className="form-control" required value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ISBN *</label>
                  <input className="form-control" required value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <input className="form-control" value={bookForm.genre} placeholder="e.g. Fiction, Science, History" onChange={e => setBookForm({ ...bookForm, genre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Published Year</label>
                  <input className="form-control" type="number" value={bookForm.publishedYear} onChange={e => setBookForm({ ...bookForm, publishedYear: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Copies *</label>
                  <input className="form-control" type="number" min="1" required value={bookForm.totalCopies} onChange={e => setBookForm({ ...bookForm, totalCopies: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input className="form-control" type="url" placeholder="https://..." value={bookForm.coverUrl} onChange={e => setBookForm({ ...bookForm, coverUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setBookForm(null); setEditingId(null); }}>
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <div className="spinner" /> : <><Check size={16} /> {editingId ? 'Update' : 'Add Book'}</>}
                </button>
              </div>
            </form>
          )}

          {loading ? <LoadingSpinner /> : (
            <div className="books-table glass-panel">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Available</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td className="text-secondary">{book.isbn}</td>
                      <td>
                        <span className={`status-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                          {book.availableCopies}
                        </span>
                      </td>
                      <td>{book.totalCopies}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.id)} disabled={deletingId === book.id}>
                            {deletingId === book.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'transactions' && (
        loading ? <LoadingSpinner /> : (
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <div className="no-results glass-panel">
                <h3>No transactions found</h3>
              </div>
            ) : transactions.map(t => (
              <div key={t.id} className={`transaction-card glass-panel ${statusClass(t.status)}`}>
                <div className="transaction-info">
                  <h3 className="transaction-title">{t.bookTitle}</h3>
                  <p className="transaction-author">by {t.bookAuthor}</p>
                  <p className="text-secondary" style={{ fontSize: '0.85rem' }}>User: {t.userEmail}</p>
                </div>
                <div className="transaction-meta">
                  <p className="text-secondary">Borrowed: {t.borrowDate}</p>
                  <p className="text-secondary">Due: {t.dueDate}</p>
                  {t.returnDate && <p className="text-secondary">Returned: {t.returnDate}</p>}
                  <span className={`status-badge ${t.status === TRANSACTION_STATUS.RETURNED ? 'available' : t.status === TRANSACTION_STATUS.OVERDUE ? 'unavailable' : 'borrowed'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboard;
