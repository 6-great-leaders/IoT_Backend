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

async function All_Articles(req, res) {
  try {
    const result = await db.query("SELECT * FROM shop_articles;");
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve all articles from database' });
  }
}

async function Modif_Article(req, res) {
  try {
    const { id } = req.params; // Récupère l'id depuis les paramètres d'URL
    const { x, y } = req.body; // Récupère x et y depuis le body de la requête

    if (!id || x === undefined || y === undefined) {
      return res.status(400).json({ error: "Missing or invalid data" });
    }

    const result = await db.query(
      "UPDATE shop_articles SET x = $1, y = $2 WHERE id = $3 RETURNING *;",
      [x, y, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.status(200).json({
      message: "Article updated successfully",
      article: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating article in DB:", error.message);
    res.status(500).json({ error: "Failed to update article in database" });
  }
}

module.exports = { getFleetStatus, All_Articles, Modif_Article, nbActiveScanner, getBI };

