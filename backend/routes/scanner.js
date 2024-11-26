const express = require('express');
const router = express.Router();
const { getArticlesScanner, scanArticle, healthcheck, checkout} = require('../controllers/scanner');

router.get('/articles/:idscanner/:iduser', getArticlesScanner);
router.post('/articles/:idscanner/:idarticle', scanArticle);
router.post('/healthcheck/:idscanner', healthcheck);
router.post('/checkout/:idscanner', checkout);

module.exports = router;
