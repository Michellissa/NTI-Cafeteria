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

app.get('/api/sites', async (req, res) => {
  console.log('Searching for Huddinge Sjukhus...');
  try {
    const response = await axios.get(`${BASE_URL}/sites`, {
      params: { filter: 'Huddinge' },
      timeout: 10000
    });
    
    const sites = response.data?.sites || [];
    console.log('Found sites:', sites.length);
    sites.forEach(s => console.log(' -', s.siteId, s.name));
    
    res.json({ sites });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Huddinge Sjukhus is site ID 7000
app.get('/api/sl', async (req, res) => {
  console.log('Fetching from Huddinge Sjukhus (site 7000)...');
  try {
    const response = await axios.get(`${BASE_URL}/sites/7000/departures`, {
      params: { timelimit: 60 },
      timeout: 15000
    });
    
    const departures = response.data?.departures || [];
    console.log('Total departures from Huddinge Sjukhus:', departures.length);
    
    res.json({ departures });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT}`);
});