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
    INSERT INTO list_article (user_id, name, active, scanned, article_id, suggested)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  const values = [userId, article.name, true, false, article.id, article.suggested]; // Supposons que l'article est actif par défaut et non scanné

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
  console.log("Received request body:", req.body);
  const GROQ_API_KEY = "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";
  const articles = JSON.stringify(await getShopArticlesForAI());
  console.log("Articles database:", articles);

  let tag_request = "";

  if (tags && tags.length >= 1) {
    tag_request = `take in account my preferences: ${tags},`;
    console.log("Tag request:", tag_request);
  }

  try {
    console.log("Sending request to Groq API...");
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
             content: `Generate a JSON response in the exact format below:
{
  "ingredients": [
    {
      "id": 0, 
      "name": "string",
      "brand": "string",
      "price": double,
      "volume": 1,
      "suggested": boolean,
      "image": "https://storage.googleapis.com/iot-images-genial/carton.png"
    }
  ]
}
Use this structure strictly without any extra text, notes, or explanations.

Rules:
1. The ingredients must come strictly from this product database: ${articles}.
2. If the item is directly part of the recipe '${recipe}', set "suggested" to false.
3. If the item is relevant but optional (like wine, spices, or other suggestions), set "suggested" to true.
4. Add always one or two suggested items in the response.
5. Always include all items (whether suggested or not) in the response.`
        }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    console.log("Groq API raw response:", response.data);

    const generatedText = response.data.choices[0].message.content;
    console.log("Generated text from Groq API:", generatedText);

    const cleanText = generatedText.replace(/```json|```|\n/g, '').trim();
    console.log("Cleaned text:", cleanText);

    const generatedJson = JSON.parse(cleanText);
    console.log("Parsed JSON:", generatedJson);

    // Mettre à jour la liste des courses de l'utilisateur
    const result = await updateUserShoppingList(generatedJson);
    console.log("Updated shopping list result:", result);

    res.status(200).json(generatedJson.ingredients);
  } catch (error) {
    console.error("Error fetching from GroqCloud API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to retrieve shopping list from AI", details: error.message });
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

