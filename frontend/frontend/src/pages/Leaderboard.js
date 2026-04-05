import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getLeaderboard();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const topClasses = ['top-1', 'top-2', 'top-3'];

  if (loading) return <div className="container loading"><div className="spinner" /></div>;

  return (
    <div className="container fade-in">
      <div className="page-header">
        <h1 className="page-title">🏆 Рейтинг</h1>
        <p className="page-subtitle">Ең үздік ойыншылар</p>
      </div>

      <div className="leaderboard-table">
        {users.map((u, i) => (
          <div key={u._id} className={`leaderboard-item glass-card ${topClasses[i] || ''}`}>
            <div className="lb-rank">{i < 3 ? medals[i] : i + 1}</div>
            <div className="lb-avatar">{u.avatar || '🎮'}</div>
            <div className="lb-info">
              <div className="lb-name">{u.name}</div>
              <div className="lb-level">Деңгей {u.level} • {u.quizzesTaken || 0} тест</div>
            </div>
            <div className="lb-score">{u.score} ⭐</div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          Әзірше ойыншылар жоқ 😔
        </div>
      )}
    </div>
  );
};

export default Leaderboard;