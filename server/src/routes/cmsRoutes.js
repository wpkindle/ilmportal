const express = require('express');
const router = express.Router();
const {
  getCategories,
  getLocations,
  getSystemConfig
} = require('../controllers/cmsController');

router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/config', getSystemConfig);

module.exports = router;
