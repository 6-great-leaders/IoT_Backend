const express = require('express');
const router = express.Router();
const { getFleetStatus, nbActiveScanner } = require('../controllers/monitoringController');

router.get('/fleet/', getFleetStatus);
router.get('/bi/', nbActiveScanner);


module.exports = router;
