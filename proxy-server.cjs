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
  console.log('Trafiklab API - searching for Huddinge Sjukhus');
  try {
    // First search for sites
    const sitesResponse = await axios.get(`${BASE_URL}/sites`, {
      params: { 
        filter: 'Huddinge sjukhus'
      },
      timeout: 15000
    });
    
    console.log('Sites response:', JSON.stringify(sitesResponse.data?.sites?.slice(0, 5), null, 2));
    
    // Get departures from correct site
    const response = await axios.get(`${BASE_URL}/sites/9522/departures`, {
      params: { 
        timelimit: 60
      },
      timeout: 15000
    });
    
    const departures = response.data?.departures || [];
    console.log('Total departures:', departures.length);
    
    const importantLines = ["172", "703", "704", "705", "713", "726", "740", "742", "865"];
    const filtered = departures.filter(d => {
      const line = d.line?.designation || d.line?.name || '';
      return importantLines.some(l => line.includes(l));
    });
    
    console.log('Filtered departures:', filtered.length);
    
    res.json({ departures: filtered });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT} - using Trafiklab API`);
});