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

// Try to find correct site
app.get('/api/sl', async (req, res) => {
  console.log('Searching for correct Huddinge site...');
  try {
    // First find the site
    const sitesResponse = await axios.get(`${BASE_URL}/sites`, {
      params: { filter: 'Huddinge sjukhus' },
      timeout: 10000
    });
    
    const sites = sitesResponse.data?.sites || [];
    const huddinge = sites.find(s => s.name?.toLowerCase().includes('sjukhus'));
    
    console.log('Found:', huddinge?.name, 'ID:', huddinge?.siteId);
    
    // Use found site or try known IDs
    const siteIds = [huddinge?.siteId, 9522, 9521, 9523];
    let departures = [];
    let foundSite = null;
    
    for (const siteId of siteIds.filter(Boolean)) {
      try {
        const depResponse = await axios.get(`${BASE_URL}/sites/${siteId}/departures`, {
          params: { timelimit: 60 },
          timeout: 10000
        });
        
        const deps = depResponse.data?.departures || [];
        const buses = deps.filter(d => d.line?.transport_mode === 'BUS');
        
        console.log(`Site ${siteId}: ${deps.length} total, ${buses.length} buses`);
        
        if (buses.length > 0 && !foundSite) {
          departures = buses;
          foundSite = siteId;
        }
      } catch (e) {}
    }
    
    console.log('Using site:', foundSite, 'buses:', departures.length);
    res.json({ departures: departures.slice(0, 20), siteId: foundSite });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT}`);
});