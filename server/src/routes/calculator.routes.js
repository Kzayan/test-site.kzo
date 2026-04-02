const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

const MATERIAL_PRICES = {
  PVC: 15000,
  ALUMINUM: 25000,
  WOOD: 35000,
  WOOD_ALUMINUM: 45000
};

const GLASS_PRICES = {
  SINGLE: 5000,
  DOUBLE: 8000,
  TRIPLE: 12000,
  ENERGY_SAVING: 15000,
  TINTED: 10000
};

router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      productType,
      width,
      height,
      material,
      glassType,
      hasInstallation = true,
      distance = 10
    } = req.body;

    const area = (width * height) / 1000000;

    let materialPrice = MATERIAL_PRICES[material] * area;
    let glassPrice = GLASS_PRICES[glassType] * area;
    
    let workPrice = materialPrice * 0.3;
    if (!hasInstallation) workPrice = 0;
    
    let transportPrice = distance * 500;
    
    let discount = 0;
    if (area > 5) discount = 0.05;
    if (area > 10) discount = 0.1;
    
    let totalPrice = (materialPrice + glassPrice + workPrice + transportPrice) * (1 - discount);

    res.json({
      area: area.toFixed(2),
      materialPrice: Math.round(materialPrice),
      glassPrice: Math.round(glassPrice),
      workPrice: Math.round(workPrice),
      transportPrice: Math.round(transportPrice),
      discount: discount * 100,
      totalPrice: Math.round(totalPrice),
      breakdown: {
        material: Math.round(materialPrice),
        glass: Math.round(glassPrice),
        work: Math.round(workPrice),
        transport: Math.round(transportPrice)
      }
    });
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

module.exports = router;