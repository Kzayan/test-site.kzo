import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: '🏠 Басты бет' },
    { path: '/quizzes', label: '📝 Тесттер' },
    { path: '/leaderboard', label: '🏆 Рейтинг' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', label: '⚙️ Админ' });
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">🧠 QWIZZ</Link>
        
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link to="/profile" className="nav-user" onClick={() => setMenuOpen(false)}>
                <span className="nav-avatar">{user.avatar || '🎮'}</span>
                <span className="nav-score">⭐ {user.score}</span>
              </Link>
              <button className="btn btn-sm btn-outline" onClick={logout}>Шығу</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>Кіру</Link>
              <Link to="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Тіркелу</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;