import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../api/auth.service';
import { BookOpen, AlertCircle } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(formData);
      // #6 Fix: Use role returned directly from the backend AuthResponse
      contextLogin(data.token, { email: data.email, role: data.role });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in">
        <div className="auth-header">
          <BookOpen className="logo-icon" size={40} />
          <h2>Create Account</h2>
          <p>Join the premium library experience</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">First Name</label>
              <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group half">
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
