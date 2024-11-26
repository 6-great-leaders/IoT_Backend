const axios = require('axios');
const db = require('../db');
require('dotenv').config();

async function getArticlesScanner(req, res) {
  try {
    const result = await db.query('SELECT la.*, sa.x, sa.y FROM list_article la JOIN shop_articles sa ON la.article_id = sa.id WHERE la.user_id = 1;');
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}

module.exports = { getArticlesScanner };

