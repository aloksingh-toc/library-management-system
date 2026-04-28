import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import MyTransactions from './pages/MyTransactions';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-root">
          <Navbar />
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/book/:id" element={<BookDetails />} />
            
            <Route path="/my-transactions" element={
              <ProtectedRoute>
                <MyTransactions />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <div className="page-container container text-center">
                  <h1>Admin Dashboard</h1>
                  <p>Admin features coming soon...</p>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
