const axios = require('axios');
require('dotenv').config();

async function getShoppingList(req, res) {
  const { Recipe, Budget } = req.body;
  try {
    console.log(process.env.GOOGLE_API_KEY);
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{ parts: [{ text: `Recipe: ${Recipe}, Budget: ${Budget}` }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.status(200).json(response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Error fetching from API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to retrieve shopping list' });
  }
}

module.exports = { getShoppingList };
