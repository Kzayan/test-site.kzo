const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// SMS код жіберу
router.post('/send-code', [
  body('phone').isMobilePhone().withMessage('Invalid phone number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    // Development режимінде кодты консольға шығару
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📱 Verification code for ${phone}: ${code}`);
    }

    res.json({ message: 'Code sent successfully', devCode: process.env.NODE_ENV !== 'production' ? code : undefined });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

// Кіру/Тіркелу
router.post('/verify', [
  body('phone').isMobilePhone(),
  body('code').isLength({ min: 6, max: 6 })
], async (req, res) => {
  const { phone, code, name, role } = req.body;

  try {
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
        expiresAt: { gt: new Date() },
        isUsed: false
      }
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { isUsed: true }
    });

    let user = await prisma.user.findUnique({
      where: { phone },
      include: { masterProfile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || null,
          role: role || 'CLIENT',
          isVerified: true
        },
        include: { masterProfile: true }
      });

      if (role === 'MASTER') {
        await prisma.masterProfile.create({
          data: {
            userId: user.id,
            isAvailable: true,
            specialty: []
          }
        });
        
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { masterProfile: true }
        });
      }
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        masterProfile: user.masterProfile
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Ағымдағы пайдаланушыны алу
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { masterProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;