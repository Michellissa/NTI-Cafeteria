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
  console.log('Fetching departures from all sites first...');
  try {
    // Get all Stockholm sites to find Huddinge Sjukhus
    const allSites = await axios.get(`${BASE_URL}/sites`, { 
      params: { filter: 'stockholm' },
      timeout: 10000 
    });
    
    // Find site containing "huddinge" and "sjukhus"
    const huddinge = allSites.data?.sites?.find(s => 
      s.name?.toLowerCase().includes('huddinge') && 
      s.name?.toLowerCase().includes('sjukhus')
    );
    
    const targetSiteId = huddinge?.siteId || 9522;
    console.log('Target site:', huddinge?.name, 'ID:', targetSiteId);
    
    // Get departures
    const response = await axios.get(`${BASE_URL}/sites/${targetSiteId}/departures`, {
      params: { timelimit: 60 },
      timeout: 15000
    });
    
    const allDeps = response.data?.departures || [];
    console.log('All departures count:', allDeps.length);
    
    // Print first 3 to understand structure
    if (allDeps.length > 0) {
      console.log('Sample departure:', JSON.stringify(allDeps[0], null, 2).substring(0, 500));
    }
    
    res.json(response.data);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT} - using Trafiklab API`);
});