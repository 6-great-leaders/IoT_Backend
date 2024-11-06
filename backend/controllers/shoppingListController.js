const axios = require('axios');
require('dotenv').config();

async function getShoppingList(req, res) {
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
        console.log("Generated Text:", generatedText);

        const cleanText = generatedText.replace(/```json|```|\n/g, '').trim();
        const generatedJson = JSON.parse(cleanText);
    
        res.status(200).json(generatedJson.ingredients);
    } catch (error) {
      console.error("Error fetching from API:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to retrieve shopping list' });
    }
  }
  
  module.exports = { getShoppingList };
  
