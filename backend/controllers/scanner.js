const axios = require('axios');
const db = require('../db');
require('dotenv').config();

async function getArticlesScanner(req, res) {
  try {
    // set the scanner to ACTIVE and set the list_id to the list scanned
    const updatescanner = await db.query("UPDATE scanner SET list_id = 1, state = 'ACTIVE', last_healthcheck = NOW() WHERE id = 1");
    // get the articles in the list and their coordinates
    const result = await db.query('SELECT la.*, sa.x, sa.y FROM list_article la JOIN shop_articles sa ON la.article_id = sa.id WHERE la.user_id = 1;');
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}

async function scanArticle(req, res) {
  try {
    const { idscanner, idarticle } = req.params;
    const scanArticleQuery = `
    DO $$
      BEGIN
        -- Vérifie si l'article est déjà dans la liste de l'utilisateur
        IF NOT EXISTS (
          SELECT 1
          FROM list_article
          WHERE article_id = `+ idarticle +`
          AND user_id = (SELECT list_id FROM scanner WHERE id = `+ idscanner +`)
        ) THEN
          -- Insérer l'article dans la liste
          INSERT INTO list_article (user_id, article_id, name, active, scanned, suggested)
          SELECT
            (SELECT list_id FROM scanner WHERE id = `+ idscanner +`), -- user_id correspondant à list_id
            sa.id, -- article_id
            sa.name, -- nom de l'article
            TRUE, -- actif
            TRUE, -- scanné
            FALSE -- non suggéré
          FROM shop_articles sa
          WHERE sa.id = ` + idarticle +`;
        ELSE
          -- Met à jour l'article existant pour marquer comme scanné
          UPDATE list_article
          SET scanned = TRUE
          WHERE article_id = `+ idarticle + `
          AND user_id = (SELECT list_id FROM scanner WHERE id = `+ idscanner + `);
        END IF;
      END $$;
      `;
    await db.query(scanArticleQuery);

    const updateScannerQuery = `
      UPDATE scanner
      SET 
        turnover = turnover + (SELECT price FROM shop_articles WHERE id = `+ idarticle +`),
        state = 'ACTIVE',
        last_healthcheck = NOW(),
        nbArticles = nbArticles + CASE
          WHEN (SELECT suggested FROM list_article WHERE article_id = `+ idarticle +` AND user_id = list_id) = FALSE THEN 1
          ELSE 0
        END,
        nbArticlesAI = nbArticlesAI + CASE
          WHEN (SELECT suggested FROM list_article WHERE article_id = `+ idarticle +` AND user_id = list_id) = TRUE THEN 1
          ELSE 0
        END
      WHERE id = `+ idscanner +`;
    `
    await db.query(updateScannerQuery);
    res.status(200).json();
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}

async function checkout(req, res) {
  try {
    const { idscanner } = req.params;
    await db.query("UPDATE scanner SET state = 'IDLE', list_id = null WHERE id = " + idscanner + ";")
    res.status(200).json();
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}


async function healthcheck(req, res) {
  try {
    const { idscanner } = req.params;
    await db.query("UPDATE scanner SET last_healthcheck = NOW(), state = 'ACTIVE' WHERE id = "+ idscanner + ";");

    res.status(200).json();
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}

async function checkScannerHealth() {
  try {
    const result = await db.query(`
      UPDATE scanner
      SET state = 'ERROR'
      WHERE state = 'ACTIVE' 
      AND last_healthcheck < NOW() - INTERVAL '3 minutes'
      RETURNING id, state;
    `);

    if (result.rows.length > 0) {
      console.log(`Scanettes mises à jour en 'ERROR':`, result.rows);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des scanettes :', error.message);
  }
}

// Use checkScannerHealth
setInterval(checkScannerHealth, 60000);
checkScannerHealth()


module.exports = { getArticlesScanner, scanArticle, healthcheck, checkout};