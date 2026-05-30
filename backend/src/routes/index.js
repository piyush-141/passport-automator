const express = require('express');
const multer = require('multer');
const { getUsageStats } = require('../services/usageTracker');
const { processWhiteBackground } = require('../controllers/rembgController');

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Usage stats endpoint
router.get('/usage', (req, res) => {
  const stats = getUsageStats();
  res.json(stats);
});

// Process background endpoint
router.post('/white-background', upload.single('image'), processWhiteBackground);

module.exports = router;
