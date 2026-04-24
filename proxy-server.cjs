const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const SL_API_KEY = '5455697ff26b484c8d9f6a94b0069a8d';
const SITE_ID = '9522';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/sl', async (req, res) => {
  console.log('SL API called, key:', SL_API_KEY.substring(0, 8) + '...');
  try {
    const response = await axios.get('https://api.sl.se/api2/realtimedeparturesV4.json', {
      params: {
        key: SL_API_KEY,
        siteid: SITE_ID,
        timewindow: 60
      },
      timeout: 10000
    });
    console.log('SL API success, buses:', response.data?.ResponseData?.Buses?.length || 0);
    res.json(response.data);
  } catch (error) {
    console.log('SL API error:', error.message);
    res.status(500).json({ error: error.message, status: error.response?.status });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});