const axios = require('axios');
const FormData = require('form-data');
const { getUsageStats, incrementUsage } = require('../services/usageTracker');

async function processWhiteBackground(req, res, next) {
  try {
    const stats = getUsageStats();
    if (stats.used >= stats.limit) {
      return res.status(403).json({ error: 'Monthly free limit reached' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const apiKey = process.env.FAPIHUB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key missing' });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('bgcolor', '(255, 255, 255, 255)');

    let response;
    try {
      response = await axios.post('https://fapihub.com/v2/rembg/color/', formData, {
        headers: {
          'ApiKey': apiKey,
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 15000 // 15 seconds timeout
      });
    } catch (apiError) {
      const status = apiError.response?.status;
      let errorMsg = 'FAPIHub service unavailable';

      if (apiError.response?.data) {
        try {
          const errorData = JSON.parse(apiError.response.data.toString());
          if (errorData.error && errorData.error.message) {
            errorMsg = errorData.error.message;
          }
        } catch (e) {
          // not JSON, fallback to status mapping
        }
      }

      if (status === 401) errorMsg = 'API key invalid';
      if (status === 402) errorMsg = 'Monthly quota exhausted';
      if (status === 429) errorMsg = 'Rate limit exceeded, try again later';

      return res.status(status || 500).json({ error: errorMsg });
    }

    // Success! Increment usage
    incrementUsage();

    res.set('Content-Type', 'image/png');
    return res.status(200).send(response.data);

  } catch (error) {
    next(error);
  }
}

module.exports = {
  processWhiteBackground
};
