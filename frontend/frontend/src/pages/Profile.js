import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        updateProfile(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="container loading"><div className="spinner" /></div>;
  if (!profile) return null;

  const accuracy = profile.totalAnswers > 0 ? Math.round((profile.correctAnswers / profile.totalAnswers) * 100) : 0;

  const badgesMap = {
    first_quiz: { icon: '🎯', name: 'Алғашқы тест' },
    perfect: { icon: '💯', name: 'Кемел ойын' },
    '1000_club': { icon: '🌟', name: '1000+ ұпай' },
    '5000_club': { icon: '👑', name: '5000+ ұпай' },
  };

  return (
    <div className="container fade-in">
      <div className="profile-header glass-card">
        <div className="profile-avatar">{profile.avatar || '🎮'}</div>
        <div className="profile-name">{profile.name}</div>
        <div className="profile-level">⭐ Деңгей {profile.level}</div>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-card glass-card">
          <div className="profile-stat-value">{profile.score}</div>
          <div className="profile-stat-label">Жалпы ұпай</div>
        </div>
        <div className="profile-stat-card glass-card">
          <div className="profile-stat-value">{profile.quizzesTaken}</div>
          <div className="profile-stat-label">Тесттер</div>
        </div>
        <div className="profile-stat-card glass-card">
          <div className="profile-stat-value">{accuracy}%</div>
          <div className="profile-stat-label">Дұрыстық</div>
        </div>
        <div className="profile-stat-card glass-card">
          <div className="profile-stat-value">{profile.correctAnswers}/{profile.totalAnswers}</div>
          <div className="profile-stat-label">Жауаптар</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>🏅 Жетістіктер</h3>
        <div className="badges-grid">
          {profile.badges && profile.badges.length > 0 ? (
            profile.badges.map(badge => (
              <div key={badge} className="badge-item">
                {badgesMap[badge]?.icon} {badgesMap[badge]?.name || badge}
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Әзірше жетістіктер жоқ. Тест тапсырыңыз!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;