const axios = require('axios');
const db = require('../db');
require('dotenv').config();

async function getFleetStatus(req, res) {
  try {
    const result = await db.query('SELECT state, id FROM scanner;');
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

async function getBI(req, res) {
  try {
    var result = {};
    const nbActiveScanner = await db.query("SELECT COUNT(id) AS NbActiveScanner FROM scanner WHERE state LIKE 'ACTIVE';");
    result.nbActiveScanner = nbActiveScanner.rows[0].nbactivescanner;
    result.nbScanner = "35";
    const scannerInfo = await db.query("SELECT SUM(turnover) as turnover, SUM(nbarticles) AS nbarticles, SUM(nbarticlesai) AS nbarticlesai FROM scanner;")
    result.turnover = scannerInfo.rows[0].turnover;
    result.nbArticles = scannerInfo.rows[0].nbarticles;
    result.suggestedArticles = "1";
    result.suggestedArticlesBought = scannerInfo.rows[0].nbarticlesai;

    res.status(200).json(result);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}


module.exports = { getFleetStatus, nbActiveScanner, getBI };

