import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimDailyBonus } from '../services/api';
import Toast from '../components/Toast';

const Home = () => {
  const { user, updateProfile } = useAuth();
  const [toast, setToast] = useState(null);

  const handleDailyBonus = async () => {
    try {
      const res = await claimDailyBonus();
      updateProfile({ score: res.score });
      setToast({ message: res.message, type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Қате', type: 'error' });
    }
  };

  const categories = [
    { name: 'IT', icon: '💻', color: '#3b82f6' },
    { name: 'Тарих', icon: '📜', color: '#8b5cf6' },
    { name: 'Қазақ тілі', icon: '📖', color: '#10b981' },
    { name: 'Логика', icon: '🧩', color: '#f59e0b' },
    { name: 'Жалпы білім', icon: '🌍', color: '#ef4444' },
  ];

  return (
    <div className="container fade-in">
      {/* Daily Bonus */}
      {user && (
        <div className="daily-bonus-card glass-card">
          <h3>🎁 Күнделікті бонус</h3>
          <p>Әр күні кіргенде бонус ұпай алыңыз!</p>
          <button className="btn btn-warning" onClick={handleDailyBonus}>
            🎁 Бонус алу
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">🚀 Қазақ тіліндегі #1 quiz платформа</div>
        <h1>Біліміңді<br />тексер QWIZZ-да!</h1>
        <p>Қызықты сұрақтар, рейтинг жүйесі, жетістіктер және көптеген мүмкіндіктер. Досыңмен жарыс!</p>
        <div className="hero-buttons">
          <Link to="/quizzes" className="btn btn-primary btn-lg">🎮 Ойынды бастау</Link>
          {!user && <Link to="/register" className="btn btn-outline btn-lg">📝 Тіркелу</Link>}
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">5+</div>
            <div className="hero-stat-label">Категория</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">25+</div>
            <div className="hero-stat-label">Сұрақтар</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">∞</div>
            <div className="hero-stat-label">Қызық</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: '1.5rem' }}>📂 Категориялар</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link key={cat.name} to={`/quizzes/${cat.name}`} className="category-card glass-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="category-icon" style={{ color: cat.color }}>{cat.icon}</span>
              <div className="category-name">{cat.name}</div>
              <div className="category-count">Тесттер →</div>
            </Link>
          ))}
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default Home;