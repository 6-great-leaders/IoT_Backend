const axios = require('axios');
const db = require('../db');
require('dotenv').config();

async function getShopArticles(req, res) { // TODO pas un endpoint une fonction
  try {
    const result = await db.query('SELECT * FROM list_article where user_id = 1');
    console.log(result.rows);
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}


async function insertListArticle(userId, article) {
  const query = `
    INSERT INTO list_article (user_id, name, active, scanned)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [userId, article.name, true, false]; // Supposons que l'article est actif par défaut et non scanné

  try {
    const result = await db.query(query, values);
    return result.rows[0].id;
  } catch (err) {
    console.error('Erreur lors de l\'insertion de l\'article', err);
    throw err;
  }
}

async function insertArticlesFromJSON(userId, articlesJSON) {
  const articles = articlesJSON.ingredients;
  const insertedIds = [];

  for (const article of articles) {
    try {
      const id = await insertListArticle(userId, article);
      insertedIds.push(id);
    } catch (err) {
      console.error(`Erreur lors de l'insertion de l'article ${article.name}`, err);
      // Décidez ici si vous voulez continuer avec les autres articles ou arrêter le processus
    }
  }
  return insertedIds;
}

async function getShoppingListFromAI(req, res) {
  const { Recipe, Budget } = req.body;
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                  text: `Generate a french and concise JSON response with just the ingredients, the quantity and their prices for the recipe: ${Recipe}. Format it as: {"ingredients": [{"name": "ingredient", "price": "price", "quantity": "quantity"}]}. No additional explanations or notes.`
              }
            ]
          }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      //console.log("Generated Text:", generatedText);

      const cleanText = generatedText.replace(/```json|```|\n/g, '').trim();
      const generatedJson = JSON.parse(cleanText);

      // ecraser la liste de course de l'user 1
      await db.query("DELETE FROM list_article WHERE user_id = 1");

      insertArticlesFromJSON(1, generatedJson);
  
      const result = await db.query('SELECT * FROM list_article where user_id = 1');
      res.status(200).json(result.rows);
      //res.status(200).json(generatedJson.ingredients);
  } catch (error) {
    console.error("Error fetching from API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from AI' });
  }
}

async function getShoppingList(req, res) {
  try {
    const result = await db.query('SELECT * FROM list_article where user_id = 1');
    console.log(result.rows);
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}

module.exports = { getShoppingListFromAI, getShoppingList };

