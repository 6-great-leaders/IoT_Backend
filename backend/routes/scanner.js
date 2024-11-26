const express = require('express');
const router = express.Router();
const { getArticlesScanner } = require('../controllers/scanner');

router.get('/articles/:id', getArticlesScanner);

module.exports = router;
