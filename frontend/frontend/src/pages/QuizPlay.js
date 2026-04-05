import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const QuizPlay = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [score, setScore] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuiz(id);
        setQuiz(data);
        setTimeLeft(data.timePerQuestion || 15);
      } catch (err) {
        setToast({ message: 'Квиз табылмады', type: 'error' });
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (showAnswer || !quiz) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [currentQ, showAnswer, quiz]);

  const handleTimeout = () => {    clearInterval(intervalRef.current);
    setShowAnswer(true);
    setAnswers(prev => [...prev, { questionId: quiz.questions[currentQ]._id, selectedOption: -1 }]);
    setTimeout(() => nextQuestion(), 1500);
  };

  const handleSelect = (idx) => {
    if (showAnswer) return;
    setSelected(idx);
  };

  const handleConfirm = async () => {
    if (selected === -1) return;
    clearInterval(intervalRef.current);
    setShowAnswer(true);

    const q = quiz.questions[currentQ];
    const isCorrect = selected === q.correctAnswer;
    const points = isCorrect ? (q.difficulty === 'hard' ? 30 : q.difficulty === 'medium' ? 20 : 10) : 0;
    if (isCorrect) setScore(prev => prev + points);

    setAnswers(prev => [...prev, { questionId: q._id, selectedOption: selected }]);

    if (currentQ === quiz.questions.length - 1) {
      setTimeout(async () => {
        try {
          await submitQuiz(id, [...answers, { questionId: q._id, selectedOption: selected }]);
          navigate(`/results/${id}`, { state: { answers: [...answers, { questionId: q._id, selectedOption: selected }], score: score + (isCorrect ? points : 0), quiz } });
        } catch (err) {
          setToast({ message: 'Қате орын алды', type: 'error' });
        }
      }, 1500);
    } else {
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  const nextQuestion = () => {
    setCurrentQ(prev => prev + 1);
    setSelected(-1);
    setShowAnswer(false);
    setTimeLeft(quiz.timePerQuestion || 15);
  };

  if (loading) return <div className="container loading"><div className="spinner" /></div>;
  if (!quiz) return null;

  const question = quiz.questions[currentQ];
  const progress = ((currentQ) / quiz.questions.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];
  const getOptionClass = (idx) => {
    if (!showAnswer) {
      return selected === idx ? 'option-btn selected' : 'option-btn';
    }
    if (idx === question.correctAnswer) return 'option-btn correct';
    if (idx === selected && idx !== question.correctAnswer) return 'option-btn wrong';
    return 'option-btn';
  };

  const timerClass = timeLeft <= 3 ? 'timer danger' : timeLeft <= 7 ? 'timer warning' : 'timer';

  return (
    <div className="container fade-in">
      <div className="quiz-play">
        {/* Progress */}
        <div className="quiz-progress">
          <span className="progress-text">{currentQ + 1} / {quiz.questions.length}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">⭐ {score}</span>
        </div>

        {/* Timer */}
        <div className={timerClass}>{timeLeft}</div>

        {/* Question */}
        <div className="question-card glass-card slide-up">
          <div className="question-number">Сұрақ {currentQ + 1}</div>
          <div className="question-text">{question.text}</div>

          <div className="options-list">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                className={getOptionClass(idx)}
                onClick={() => handleSelect(idx)}
                disabled={showAnswer}
              >
                <span className="option-letter">{letters[idx]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm */}
        {!showAnswer && selected !== -1 && (
          <button className="btn btn-primary btn-block btn-lg" onClick={handleConfirm}>            ✅ Жауапты растау
          </button>
        )}

        {showAnswer && (
          <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {selected === question.correctAnswer ? '🎉 Дұрыс!' : '😔 Қате!'} 
            {question.explanation && <div style={{ marginTop: 8, fontStyle: 'italic' }}>💡 {question.explanation}</div>}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default QuizPlay;