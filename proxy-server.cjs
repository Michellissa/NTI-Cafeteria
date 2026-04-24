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
  console.log('Trafiklab API called');
  try {
    // First get all sites with stop areas to find Huddinge Sjukhus
    const sitesResponse = await axios.get(`${BASE_URL}/sites`, {
      params: { expand: true, filter: 'Huddinge' },
      timeout: 15000
    });
    
    const huddingeSite = sitesResponse.data?.sites?.find(s => 
      s.name?.toLowerCase().includes('huddinge sjukhus')
    );
    
    console.log('Found site:', huddingeSite?.name, 'id:', huddingeSite?.siteId);
    
    // Get departures from the specific site
    const siteId = huddingeSite?.siteId || 9522;
    const response = await axios.get(`${BASE_URL}/sites/${siteId}/departures`, {
      params: { timelimit: 60 },
      timeout: 15000
    });
    console.log('Trafiklab success:', response.data?.departures?.length || 0, 'departures');
    res.json(response.data);
  } catch (error) {
    console.log('Trafiklab error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT} - using Trafiklab API`);
});