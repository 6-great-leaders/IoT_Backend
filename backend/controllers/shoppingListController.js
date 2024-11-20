const axios = require('axios');
const db = require('../db');
require('dotenv').config();

async function getShopArticles(req, res) {
  try {
    const result = await db.query('SELECT * FROM shop_articles;');
    //console.log(result.rows);
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}

async function getShopArticlesForAI() {
  try {
    const result = await db.query('SELECT id, name, brand, price FROM shop_articles;');
    return(result.rows)
  }
  catch (error) {
    console.error("Error fetching from DB:", error.response ? error.response.data : error.message);
    throw (error);
    // res.status(500).json({ error: 'Failed to retrieve shopping list from database' });
  }
}


async function insertListArticle(userId, article) {
  const query = `
    INSERT INTO list_article (user_id, name, active, scanned, article_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [userId, article.name, true, false, article.id]; // Supposons que l'article est actif par défaut et non scanné

  try {
    // console.log(query)
    const result = await db.query(query, values);
    // console.log(result.rows[0]);
    return result.rows[0].id;
  } catch (err) {
    console.error('Erreur lors de l\'insertion de l\'article', err);
    throw err;
  }
}

async function insertArticlesFromJSON(userId, articlesJSON) {
  const articles = articlesJSON.ingredients;
  // console.log(JSON.stringify(articles))
  const insertedIds = [];

  for (const article of articles) {
    try {
      const id = await insertListArticle(userId, article);
      insertedIds.push(id);
      // console.log("inserted " + article);
    } catch (err) {
      console.error(`Erreur lors de l'insertion de l'article ${article.name}`, err);
      // Décidez ici si vous voulez continuer avec les autres articles ou arrêter le processus
    }
  }
  return insertedIds;
}

async function getShoppingListFromAI(req, res) {
  const { recipe, budget, tags } = req.body;
  const articles = JSON.stringify(await getShopArticlesForAI());
  var tag_request = ""
  // console.log(tags.length);
  if (tags != null && tags.length >= 1) {
    tag_request = `take in account my preferences : ${tags},`
  }
  // console.log(tag_request)
  //console.log(articles);
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                  text: `Generate a concise JSON response with just the ingredients from this product database : ${articles},${tag_request} the quantity and their prices for the following french recipe: ${recipe}. Format it as: {"ingredients": [{"id": int, "name": "ingredient", "price": "price", "quantity": "quantity"}]}. No additional explanations or notes.`
              }
            ]
          }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
      );

      // console.log(response.data.candidates[0].content.parts[0])
      const generatedText = response.data.candidates[0].content.parts[0].text;

      const cleanText = generatedText.replace(/```json|```|\n/g, '').trim();
      const generatedJson = JSON.parse(cleanText);

      // console.log(generatedJson);

      const result = await updateUserShoppingList(generatedJson);
      // console.log(result)

      res.status(200).json(result);
      //res.status(200).json(generatedJson.ingredients);
  } catch (error) {
    console.error("Error fetching from API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list from AI' });
  }
}


async function updateUserShoppingList(input) {
  try {
    await db.query("DELETE FROM list_article WHERE user_id = 1");
    await insertArticlesFromJSON(1, input);
    const result = await db.query('SELECT * FROM list_article where user_id = 1');
    //console.log(result.rows)
    return result.rows;
  }
  catch (error){
    console.error("Error fetching from API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to update user list' });
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

module.exports = { getShoppingListFromAI, getShoppingList, getShopArticles };

