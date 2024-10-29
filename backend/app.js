require('dotenv').config();
const express = require('express');
const app = express();
const shoppingListRoutes = require('./routes/shoppingList');

app.use(express.json());
app.use('/shopping-list', shoppingListRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
