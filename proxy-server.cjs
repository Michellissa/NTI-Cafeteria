const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/api/sl', async (req, res) => {
  try {
    const response = await axios.get('https://api.sl.se/api2/realtimedeparturesV4.json', {
      params: {
        key: '9c4ec98e1f5242f1be14e1b111e1ed77',
        siteid: '9522',
        timewindow: 60
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});