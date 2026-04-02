import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'CLIENT';
  
  const { sendVerificationCode, login } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      setError('Телефон нөмірін дұрыс енгізіңіз');
      return;
    }
    
    setLoading(true);
    setError('');
    const result = await sendVerificationCode(phone);
    setLoading(false);
    
    if (result.success) {
      if (result.devCode) {
        setDevCode(result.devCode);
      }
      setStep(2);
    } else {
      setError(result.error);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Кодты дұрыс енгізіңіз');
      return;
    }
    
    setLoading(true);
    setError('');
    const result = await login(phone, code, name, role);
    setLoading(false);
    
    if (result.success) {
      navigate(role === 'MASTER' ? '/master' : '/catalog');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">RomchiStyle</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 1 ? 'Кіру немесе тіркелу' : 'Кодты енгізіңіз'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Телефон нөмірі</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 777 777 7777"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Аты-жөні (міндетті емес)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Есіміңіз"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Рөл</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              >
                <option value="CLIENT">Клиент</option>
                <option value="MASTER">Шебер</option>
              </select>
            </div>
            
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Жіберілуде...' : 'Код жіберу'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMS код</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 таңбалы код"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 text-center text-2xl tracking-widest"
              />
              {devCode && (
                <p className="text-xs text-gray-500 mt-2">
                  Development коды: {devCode}
                </p>
              )}
            </div>
            
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Тексерілуде...' : 'Кіру'}
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 text-primary-600 hover:text-primary-700 transition"
            >
              Артқа
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;