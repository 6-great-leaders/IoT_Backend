const axios = require('axios');
const db = require('../db');
require('dotenv').config();

async function getFleetStatus(req, res) {
  try {
    const result = await db.query('SELECT * FROM scanner;');
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}

async function nbActiveScanner(req, res) {
  try {
    const result = await db.query("SELECT COUNT(id) AS NbActiveScanner FROM scanner WHERE state LIKE 'ACTIVE';");
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}


module.exports = { getFleetStatus, nbActiveScanner };

