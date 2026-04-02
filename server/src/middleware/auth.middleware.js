const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { masterProfile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireMaster = (req, res, next) => {
  if (req.user.role !== 'MASTER') {
    return res.status(403).json({ error: 'Master access required' });
  }
  next();
};

const requireClient = (req, res, next) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Client access required' });
  }
  next();
};

module.exports = { authenticateToken, requireMaster, requireClient };