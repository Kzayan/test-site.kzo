import React, { useEffect, useState } from 'react';
import { getAdminStats, createQuiz, deleteQuiz, getAdminUsers } from '../services/api';
import Toast from '../components/Toast';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quizForm, setQuizForm] = useState({
    title: '', description: '', category: 'IT', difficulty: 'medium', timePerQuestion: 15,
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsData, usersData] = await Promise.all([getAdminStats(), getAdminUsers()]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
    }));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...quizForm.questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuizForm(prev => ({ ...prev, questions: updated }));
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...quizForm.questions];
    updated[qIdx].options[optIdx] = value;
    setQuizForm(prev => ({ ...prev, questions: updated }));
  };

  const handleCreateQuiz = async (e) => {    e.preventDefault();
    try {
      await createQuiz(quizForm);
      setToast({ message: '✅ Квиз жасалды!', type: 'success' });
      setShowForm(false);
      setQuizForm({
        title: '', description: '', category: 'IT', difficulty: 'medium', timePerQuestion: 15,
        questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
      });
    } catch (err) {
      setToast({ message: 'Қате', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Квизді жойғыңыз келе ме?')) return;
    try {
      await deleteQuiz(id);
      setToast({ message: '🗑 Квиз жойылды', type: 'success' });
    } catch (err) {
      setToast({ message: 'Қате', type: 'error' });
    }
  };

  if (loading) return <div className="container loading"><div className="spinner" /></div>;

  return (
    <div className="container fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Админ панель</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="admin-stats">
          <div className="admin-stat-card glass-card">
            <div className="admin-stat-value">{stats.totalUsers}</div>
            <div className="admin-stat-label">👥 Пайдаланушылар</div>
          </div>
          <div className="admin-stat-card glass-card">
            <div className="admin-stat-value">{stats.totalQuizzes}</div>
            <div className="admin-stat-label">📝 Тесттер</div>
          </div>
          <div className="admin-stat-card glass-card">
            <div className="admin-stat-value">{stats.totalQuestions}</div>
            <div className="admin-stat-label">❓ Сұрақтар</div>
          </div>
          <div className="admin-stat-card glass-card">
            <div className="admin-stat-value">{stats.totalScore}</div>
            <div className="admin-stat-label">⭐ Жалпы ұпай</div>          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ➕ Жаңа тест қосу
        </button>
      </div>

      {/* Add Quiz Form */}
      {showForm && (
        <div className="add-quiz-form glass-card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 20 }}>📝 Жаңа тест</h3>
          <form onSubmit={handleCreateQuiz}>
            <div className="input-group">
              <label>Атауы</label>
              <input className="input" value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Сипаттама</label>
              <input className="input" value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="input-group">
                <label>Категория</label>
                <select className="input" value={quizForm.category} onChange={e => setQuizForm({ ...quizForm, category: e.target.value })}>
                  <option>IT</option><option>Тарих</option><option>Қазақ тілі</option><option>Логика</option><option>Жалпы білім</option>
                </select>
              </div>
              <div className="input-group">
                <label>Қиындық</label>
                <select className="input" value={quizForm.difficulty} onChange={e => setQuizForm({ ...quizForm, difficulty: e.target.value })}>
                  <option value="easy">Оңай</option><option value="medium">Орташа</option><option value="hard">Қиын</option>
                </select>
              </div>
              <div className="input-group">
                <label>Уақыт (сек)</label>
                <input type="number" className="input" value={quizForm.timePerQuestion} onChange={e => setQuizForm({ ...quizForm, timePerQuestion: parseInt(e.target.value) })} />
              </div>
            </div>

            {quizForm.questions.map((q, qIdx) => (
              <div key={qIdx} className="question-form">
                <h4>Сұрақ {qIdx + 1}</h4>
                <div className="input-group">
                  <label>Сұрақ мәтіні</label>
                  <input className="input" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} required />
                </div>                <div className="options-form">
                  {q.options.map((opt, oIdx) => (
                    <div className="input-group" key={oIdx}>
                      <label>{['A', 'B', 'C', 'D'][oIdx]}</label>
                      <input className="input" value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} required />
                    </div>
                  ))}
                </div>
                <div className="correct-select">
                  <label>Дұрыс жауап:</label>
                  <select className="input" value={q.correctAnswer} onChange={e => updateQuestion(qIdx, 'correctAnswer', parseInt(e.target.value))} style={{ maxWidth: 150 }}>
                    <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Түсіндірме (опционально)</label>
                  <input className="input" value={q.explanation} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} />
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-outline" onClick={addQuestion} style={{ marginBottom: 16 }}>
              ➕ Сұрақ қосу
            </button>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">✅ Тестті сақтау</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Болдырмау</button>
            </div>
          </form>
        </div>
      )}

      {/* Users */}
      <div className="admin-section">
        <h3>👥 Пайдаланушылар</h3>
        <div className="leaderboard-table">
          {users.map((u, i) => (
            <div key={u._id} className="leaderboard-item glass-card">
              <div className="lb-rank">{i + 1}</div>
              <div className="lb-avatar">{u.avatar || '🎮'}</div>
              <div className="lb-info">
                <div className="lb-name">{u.name}</div>
                <div className="lb-level">{u.email} • Деңгей {u.level}</div>
              </div>
              <div className="lb-score">{u.score} ⭐</div>
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default Admin;