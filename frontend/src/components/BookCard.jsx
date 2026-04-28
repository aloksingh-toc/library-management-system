import React from 'react';
import { Link } from 'react-router-dom';
import { Book as BookIcon, Calendar } from 'lucide-react';
import './BookCard.css';

const BookCard = ({ book }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="book-card glass-panel">
      <div className="book-card-header">
        <div className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? 'Available' : 'Out of Stock'}
        </div>
      </div>
      
      <div className="book-card-body">
        <h3 className="book-title" title={book.title}>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        
        <div className="book-stats">
          <div className="stat">
            <BookIcon size={16} />
            <span>{book.availableCopies} left</span>
          </div>
          <div className="stat">
            <Calendar size={16} />
            <span>{book.publishedYear || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div className="book-card-footer">
        <Link to={`/book/${book.id}`} className="btn btn-primary w-full">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
