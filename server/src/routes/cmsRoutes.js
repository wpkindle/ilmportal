const express = require('express');
const router = express.Router();
const {
  getCategories,
  getLocations,
  getSystemConfig,
  getAllPages,
  getPage,
  submitContactMessage
} = require('../controllers/cmsController');

router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/config', getSystemConfig);
router.get('/pages', getAllPages);
router.get('/pages/:slug', getPage);
router.post('/contact', submitContactMessage);

module.exports = router;
