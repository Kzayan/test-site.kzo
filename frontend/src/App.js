import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import QuizPlay from './pages/QuizPlay';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  return (
    <>
      <div className="app-bg" />
      <AuthProvider>
        <Navbar />
        <main className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quizzes/:category" element={<QuizList />} />
            <Route path="/quiz/:id" element={<QuizPlay />} />
            <Route path="/results/:quizId" element={<Results />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </>
  );
}

export default App;