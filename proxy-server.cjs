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

// Find site by name
app.get('/api/site/:name', async (req, res) => {
  const searchName = req.params.name;
  console.log('Searching for:', searchName);
  
  try {
    const response = await axios.get(`${BASE_URL}/sites`, {
      params: { filter: searchName },
      timeout: 10000
    });
    
    const sites = response.data?.sites || [];
    sites.forEach(s => console.log(`Site: ${s.siteId} - ${s.name}`));
    
    res.json({ sites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find and return departures from correct Huddinge site
app.get('/api/sl', async (req, res) => {
  console.log('Finding Huddinge Sjukhus site...');
  try {
    // Try different search terms
    const searches = ['Huddinge sjukhus', 'Huddinge', 'Södertörns'];
    let foundSite = null;
    let allSites = [];
    
    for (const search of searches) {
      try {
        const response = await axios.get(`${BASE_URL}/sites`, {
          params: { filter: search },
          timeout: 5000
        });
        
        const sites = response.data?.sites || [];
        allSites.push(...sites);
        
        const match = sites.find(s => 
          s.name?.toLowerCase().includes('huddinge') && 
          s.name?.toLowerCase().includes('sjukhus')
        );
        
        if (match && !foundSite) {
          foundSite = match;
        }
      } catch {}
    }
    
    console.log('All sites:', allSites.map(s => `${s.siteId}: ${s.name}`).join(', '));
    console.log('Found:', foundSite?.name, 'ID:', foundSite?.siteId);
    
    // Use found site
    const siteId = foundSite?.siteId || 9522;
    
    const depResponse = await axios.get(`${BASE_URL}/sites/${siteId}/departures`, {
      params: { timelimit: 60 },
      timeout: 10000
    });
    
    res.json({ 
      departures: depResponse.data?.departures || [],
      site: foundSite 
    });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy on http://localhost:${PORT}`);
});