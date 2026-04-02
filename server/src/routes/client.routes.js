const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Клиент профилін жаңарту
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Пікір қалдыру
router.post('/review/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { rating, comment } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { reviews: true }
    });

    if (!order || order.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Order not completed yet' });
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        masterId: order.masterId,
        clientId: req.user.id,
        rating: parseInt(rating),
        comment
      }
    });

    // Шебердің рейтингін жаңарту
    const reviews = await prisma.review.findMany({
      where: { masterId: order.masterId }
    });
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await prisma.masterProfile.update({
      where: { userId: order.masterId },
      data: { rating: avgRating }
    });

    res.json(review);
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;