import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { answers, score, quiz } = location.state || {};

  if (!answers || !quiz) {
    navigate('/');
    return null;
  }

  const correct = answers.filter((a, i) => a.selectedOption === quiz.questions[i]?.correctAnswer).length;
  const total = quiz.questions.length;
  const percentage = Math.round((correct / total) * 100);

  const getEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🌟';
    if (percentage >= 50) return '👍';
    return '💪';
  };

  const getMessage = () => {
    if (percentage >= 90) return 'Керемет! Сіз — нағыз білгір!';
    if (percentage >= 70) return 'Жақсы нәтиже! Жалғастырыңыз!';
    if (percentage >= 50) return 'Жаман емес! Тағы байқап көріңіз!';
    return 'Қайталап көріңіз, сіз міндетті түрде жақсартасыз!';
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="container fade-in">
      <div className="results-container">
        <div className="page-header">
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{getEmoji()}</div>
          <h1 className="page-title">{getMessage()}</h1>
        </div>

        <div className="results-score-circle glass-card">
          <div className="results-score-value">{percentage}%</div>
          <div className="results-score-label">{correct}/{total} дұрыс</div>
        </div>

        <div className="results-stats">
          <div className="result-stat correct glass-card">
            <div className="result-stat-value">{correct}</div>
            <div className="result-stat-label">✅ Дұрыс</div>
          </div>
          <div className="result-stat wrong glass-card">
            <div className="result-stat-value">{total - correct}</div>
            <div className="result-stat-label">❌ Қате</div>
          </div>
          <div className="result-stat score glass-card">
            <div className="result-stat-value">+{score}</div>
            <div className="result-stat-label">⭐ Ұпай</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          <Link to="/quizzes" className="btn btn-primary">📝 Басқа тест</Link>
          <Link to="/" className="btn btn-outline">🏠 Басты бет</Link>
        </div>

        {/* Review */}
        <div className="results-review">
          <h3 style={{ marginBottom: 16, fontSize: '1.2rem' }}>📋 Сұрақтарды шолу</h3>
          {answers.map((a, i) => {
            const q = quiz.questions[i];
            if (!q) return null;
            const isCorrect = a.selectedOption === q.correctAnswer;
            return (
              <div key={i} className={`review-item ${isCorrect ? 'correct' : 'wrong'} glass-card`}>
                <div className="review-question">{i + 1}. {q.text}</div>
                <div className="review-answer">
                  Сіздің жауабыңыз: <span className={isCorrect ? 'correct-text' : 'wrong-text'}>
                    {a.selectedOption === -1 ? 'Жауап берілмеді' : `${letters[a.selectedOption]}. ${q.options[a.selectedOption]}`}
                  </span>
                  {!isCorrect && (
                    <>
                      <br />
                      Дұрыс жауап: <span className="correct-text">{letters[q.correctAnswer]}. {q.options[q.correctAnswer]}</span>
                    </>
                  )}
                </div>
                {q.explanation && <div className="review-explanation">💡 {q.explanation}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;