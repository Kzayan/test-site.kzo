const express = require('express');
const { authenticateToken, requireMaster } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Жаңа тапсырыс жасау
router.post('/', authenticateToken, requireMaster, async (req, res) => {
  try {
    const {
      clientId,
      productType,
      width,
      height,
      material,
      color,
      glassType,
      materialPrice,
      workPrice,
      transportPrice,
      totalPrice,
      roomPhotos,
      address,
      latitude,
      longitude,
      scheduledDate,
      description,
      clientName,
      clientPhone
    } = req.body;

    let client = await prisma.user.findUnique({ where: { id: clientId } });
    
    if (!client && clientPhone) {
      client = await prisma.user.create({
        data: {
          phone: clientPhone,
          name: clientName,
          role: 'CLIENT'
        }
      });
      clientId = client.id;
    }

    const order = await prisma.order.create({
      data: {
        masterId: req.user.id,
        clientId,
        productType,
        width: parseFloat(width),
        height: parseFloat(height),
        material,
        color,
        glassType,
        materialPrice: parseFloat(materialPrice),
        workPrice: parseFloat(workPrice),
        transportPrice: parseFloat(transportPrice),
        totalPrice: parseFloat(totalPrice),
        roomPhotos: roomPhotos || [],
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        description,
        status: 'PENDING'
      },
      include: {
        client: true,
        master: true
      }
    });

    await prisma.notification.create({
      data: {
        userId: clientId,
        title: 'Жаңа тапсырыс',
        message: `${req.user.name || 'Шебер'} сізге жаңа тапсырыс жасады`,
        type: 'NEW_ORDER',
        data: { orderId: order.id }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Тапсырыс статусын жаңарту
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { master: true, client: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.masterId !== req.user.id && order.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        completedDate: status === 'COMPLETED' ? new Date() : undefined
      }
    });

    const notificationTitle = {
      ACCEPTED: 'Тапсырыс қабылданды',
      IN_PROGRESS: 'Тапсырыс орындалуда',
      COMPLETED: 'Тапсырыс орындалды',
      CANCELLED: 'Тапсырыс бас тартылды'
    }[status] || 'Статус өзгерді';

    await prisma.notification.create({
      data: {
        userId: order.masterId === req.user.id ? order.clientId : order.masterId,
        title: notificationTitle,
        message: `${req.user.name || 'Пайдаланушы'} тапсырыс статусын өзгертті: ${status}`,
        type: 'ORDER_ACCEPTED',
        data: { orderId: order.id, status }
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Шебердің тапсырыстары
router.get('/master', authenticateToken, requireMaster, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const where = { masterId: req.user.id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, phone: true }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Клиенттің тапсырыстары
router.get('/client', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { clientId: req.user.id },
      include: {
        master: {
          select: { id: true, name: true, masterProfile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Fetch client orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Бір тапсырысты алу
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        master: {
          include: { masterProfile: true }
        },
        client: true,
        reviews: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.masterId !== req.user.id && order.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;