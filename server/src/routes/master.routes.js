const express = require('express');
const { authenticateToken, requireMaster } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Шебер профилін жаңарту
router.put('/profile', authenticateToken, requireMaster, async (req, res) => {
  try {
    const { name, specialty, experience, description, location, isAvailable } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });

    const profile = await prisma.masterProfile.update({
      where: { userId: req.user.id },
      data: {
        specialty: specialty || [],
        experience: experience ? parseInt(experience) : null,
        description,
        location,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Жақын маңдағы шеберлер
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location required' });
    }

    const masters = await prisma.masterProfile.findMany({
      where: {
        isAvailable: true,
        latitude: { not: null },
        longitude: { not: null }
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    // Қашықтықты есептеу
    const nearby = masters
      .map(master => ({
        ...master,
        distance: calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          master.latitude,
          master.longitude
        )
      }))
      .filter(master => master.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (error) {
    console.error('Nearby masters error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby masters' });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;