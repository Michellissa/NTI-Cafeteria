const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Using new Trafiklab SL Transport API - NO KEY NEEDED!
const BASE_URL = 'https://transport.integration.sl.se/v1';

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
  console.log('Trafiklab API called for Huddinge Sjukhus');
  try {
    // SiteId 9522 is Huddinge Sjukhus in the old API
    // But for Trafiklab, we need to find the right site
    // Try site 9522 directly
    const response = await axios.get(`${BASE_URL}/sites/9522/departures`, {
      params: { 
        timelimit: 60,
        transportMode: 'BUS'  // Only buses
      },
      timeout: 15000
    });
    
    const departures = response.data?.departures || [];
    console.log('Bus departures:', departures.length);
    
    // Filter only the important bus lines
    const importantLines = ["172", "703", "704", "705", "713", "726", "740", "742", "865"];
    const filtered = departures.filter(d => {
      const line = d.line?.designation || d.line?.name || '';
      return importantLines.some(l => line.includes(l));
    });
    
    console.log('Filtered to important lines:', filtered.length);
    
    res.json({ departures: filtered });
  } catch (error) {
    console.log('Trafiklab error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT} - using Trafiklab API`);
});