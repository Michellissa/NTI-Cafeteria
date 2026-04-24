const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const BASE_URL = 'https://transport.integration.sl.se/v1';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Trafiklab SL Transport API - NO KEY NEEDED
app.get('/api/sl', async (req, res) => {
  console.log('Fetching Huddinge Sjukhus departures...');
  try {
    // Site 9522 = Huddinge Sjukhus
    const response = await axios.get(`${BASE_URL}/sites/9522/departures`, {
      params: { timelimit: 60 },
      timeout: 15000
    });
    
    const departures = response.data?.departures || [];
    console.log('Total departures:', departures.length);
    
    // Return all - let client filter
    res.json({ departures });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT}`);
});