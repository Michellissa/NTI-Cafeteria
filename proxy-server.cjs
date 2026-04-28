const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const BASE_URL = 'https://transport.integration.sl.se/v1';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.log('Error loading data:', e.message);
  }
  return {
    news: [],
    teachers: []
  };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/data', (req, res) => {
  console.log('Loading data...');
  const data = loadData();
  res.json(data);
});

app.post('/api/data', (req, res) => {
  console.log('Saving data...');
  const currentData = loadData();
  const newData = req.body;
  
  if (newData.news) {
    currentData.news = newData.news;
  }
  if (newData.teachers) currentData.teachers = newData.teachers;
  
  saveData(currentData);
  res.json({ success: true, data: currentData });
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
  console.log('Fetching from Flemingsberg station (site 7006)...');
  try {
    const response = await axios.get(`${BASE_URL}/sites/7006/departures`, {
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