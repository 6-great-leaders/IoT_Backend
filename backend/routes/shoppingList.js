const express = require('express');
const router = express.Router();
const { getShoppingListFromAI, getShoppingList, getShopArticles} = require('../controllers/shoppingListController');

router.get('/shop_articles/', getShopArticles);
router.post('/:id', getShoppingListFromAI);
router.get('/:id', getShoppingList);


module.exports = router;
