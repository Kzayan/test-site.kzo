import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuizzes } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuizList = () => {
  const { category } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getQuizzes(category);
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchQuizzes();
  }, [category]);

  const diffLabel = { easy: 'Оңай', medium: 'Орташа', hard: 'Қиын' };
  const diffClass = { easy: 'diff-easy', medium: 'diff-medium', hard: 'diff-hard' };

  if (loading) return <div className="container loading"><div className="spinner" /></div>;

  return (
    <div className="container fade-in">
      <div className="page-header">
        <h1 className="page-title">{category ? `${category} тесттері` : '📝 Барлық тесттер'}</h1>
        <p className="page-subtitle">Категорияны таңдап, білімді тексер!</p>
      </div>

      <div className="quizzes-grid">
        {quizzes.map(quiz => (
          <Link key={quiz._id} to={`/quiz/${quiz._id}`} className="quiz-card glass-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="quiz-card-header">
              <span className="quiz-category">{quiz.category}</span>
              <span className={`quiz-difficulty ${diffClass[quiz.difficulty]}`}>{diffLabel[quiz.difficulty]}</span>
            </div>
            <div className="quiz-title">{quiz.title}</div>
            <div className="quiz-desc">{quiz.description}</div>
            <div className="quiz-meta">
              <span>❓ {quiz.questions?.length || 0} сұрақ</span>
              <span>⏱ {quiz.timePerQuestion} сек</span>
              <span>⭐ {quiz.difficulty === 'hard' ? 30 : quiz.difficulty === 'medium' ? 20 : 10} ұпай/сұрақ</span>
            </div>
          </Link>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          Бұл категорияда тесттер жоқ 😔
        </div>
      )}

      {!user && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Нәтиже сақтау үшін тіркеліңіз</p>
          <Link to="/register" className="btn btn-primary">📝 Тіркелу</Link>
        </div>
      )}
    </div>
  );
};

export default QuizList;