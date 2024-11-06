const express = require('express');
const router = express.Router();
const { getShoppingListFromAI, getShoppingList } = require('../controllers/shoppingListController');

router.post('/:id', getShoppingListFromAI);
router.get('/:id', getShoppingList);

module.exports = router;
