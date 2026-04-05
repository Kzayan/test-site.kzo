import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      setToast({ message: '✅ Сәтті кірдіңіз!', type: 'success' });
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Қате');
    }
  };

  return (
    <div className="container">
      <div className="auth-container fade-in">
        <div className="auth-card glass-card">
          <div className="auth-title">👋 Қайта қош келдіңіз!</div>
          <div className="auth-subtitle">QWIZZ-ға кіріңіз</div>

          {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
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
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">🔐 Кіру</button>
          </form>

          <div className="auth-footer">
            Аккаунт жоқ па? <Link to="/register">Тіркелу</Link>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default Login;