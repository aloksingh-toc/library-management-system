import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, Library, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <BookOpen className="logo-icon" size={28} />
          <span>LMS Premium</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Catalog</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/my-transactions" className="nav-link">
                <Library size={18} /> My Books
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">
                  <ShieldCheck size={18} /> Admin Dashboard
                </Link>
              )}
              <div className="user-profile">
                <Link to="/profile" className="avatar" title="My Profile">
                  <User size={18} />
                </Link>
                <span className="user-email">{user?.email?.split('@')[0]}</span>
                <button onClick={handleLogout} className="btn-logout" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
