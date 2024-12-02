const express = require('express');
const router = express.Router();
const { getFleetStatus, nbActiveScanner, getBI, All_Articles, Modif_Article } = require('../controllers/monitoringController');

router.get('/fleet/', getFleetStatus);
router.get('/nbactive', nbActiveScanner);
router.get('/bi', getBI);
router.get('/all_articles', All_Articles);
router.put('/modif_article/:id', Modif_Article);

module.exports = router;
