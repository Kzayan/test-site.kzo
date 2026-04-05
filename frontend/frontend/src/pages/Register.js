import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Парольдер сәйкес келмейді');
      return;
    }
    try {
      await register(form.name, form.email, form.password);
      setToast({ message: '✅ Сәтті тіркелдіңіз!', type: 'success' });
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Қате');
    }
  };

  return (
    <div className="container">
      <div className="auth-container fade-in">
        <div className="auth-card glass-card">
          <div className="auth-title">🚀 Тіркелу</div>
          <div className="auth-subtitle">QWIZZ-қа қосылыңыз</div>

          {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Атыңыз</label>
              <input
                type="text"
                className="input"
                placeholder="Аyan"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                className="input"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Пароль</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="input-group">
              <label>Парольді растау</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">📝 Тіркелу</button>
          </form>

          <div className="auth-footer">
            Аккаунт бар ма? <Link to="/login">Кіру</Link>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default Register;