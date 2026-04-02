import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">RomchiStyle</div>
          <div className="flex gap-4">
            {user ? (
              <Link
                to={user.role === 'MASTER' ? '/master' : '/catalog'}
                className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
              >
                Басты бет
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-primary-600 hover:text-primary-700 transition"
                >
                  Кіру
                </Link>
                <Link
                  to="/login?role=MASTER"
                  className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
                >
                  Шебер ретінде бастау
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Есік пен терезені{' '}
            <span className="gradient-text">3D-да көріңіз</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Шеберлер үшін арналған платформа. 5 минутта баға есептеу, 3D визуализация, 
            тапсырыстарды басқару.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/login?role=MASTER"
              className="px-8 py-4 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition transform hover:scale-105 shadow-lg"
            >
              Шебер ретінде бастау
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
            >
              Клиент ретінде көру
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Негізгі мүмкіндіктер
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg card-hover"
              >
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Бүгін бастаңыз
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Жаңа клиенттер табыңыз, тапсырыстарды басқарыңыз, бизнесіңізді дамытыңыз
          </p>
          <Link
            to="/login?role=MASTER"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            Тіркелу
          </Link>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: '🎨',
    title: '3D визуализация',
    description: 'Клиенттің бөлмесіне терезе/есікті нақты орналастырып көрсетіңіз.'
  },
  {
    icon: '💰',
    title: 'Жылдам баға калькуляторы',
    description: 'Материал + жұмыс + көлік – 5 минут ішінде есептеңіз.'
  },
  {
    icon: '🗺️',
    title: 'Карта бойынша шеберлер',
    description: 'Сізге жақын орналасқан усталарды тауып, тез байланысыңыз.'
  }
];

export default LandingPage;