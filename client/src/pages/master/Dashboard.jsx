import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const MasterDashboard = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/master', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
      
      const pending = response.data.orders.filter(o => o.status === 'PENDING').length;
      const inProgress = response.data.orders.filter(o => o.status === 'IN_PROGRESS').length;
      const completed = response.data.orders.filter(o => o.status === 'COMPLETED').length;
      
      setStats({
        pending,
        inProgress,
        completed,
        total: response.data.orders.length
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Күтуде',
      ACCEPTED: 'Қабылданды',
      IN_PROGRESS: 'Орындалуда',
      COMPLETED: 'Аяқталды',
      CANCELLED: 'Бас тартылды'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Басқару панелі</h1>
        <Link
          to="/master/new-order"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          + Жаңа тапсырыс
        </Link>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-gray-600 dark:text-gray-400">Барлық тапсырыс</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-gray-600 dark:text-gray-400">Күтуде</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
          <div className="text-gray-600 dark:text-gray-400">Орындалуда</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-gray-600 dark:text-gray-400">Аяқталды</div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Соңғы тапсырыстар</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Өнім</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Өлшемдері</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бағасы</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{order.client?.name || 'Клиент'}</div>
                      <div className="text-sm text-gray-500">{order.client?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.productType === 'WINDOW' ? 'Терезе' : 
                     order.productType === 'DOOR' ? 'Есік' : 'Балкон есігі'}
                  </td>
                  <td className="px-6 py-4">
                    {order.width}×{order.height} см
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {order.totalPrice.toLocaleString()} ₸
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/order/${order.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Көру
                      </Link>
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                          className="text-green-600 hover:text-green-700"
                        >
                          Қабылдау
                        </button>
                      )}
                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          Бастау
                        </button>
                      )}
                      {order.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                          className="text-green-600 hover:text-green-700"
                        >
                          Аяқтау
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;