const express = require('express');
const router = express.Router();
const { getFleetStatus, nbActiveScanner, getBI } = require('../controllers/monitoringController');

router.get('/fleet/', getFleetStatus);
router.get('/nbactive', nbActiveScanner);
router.get('/bi', getBI);


module.exports = router;
