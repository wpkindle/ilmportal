const Category = require('../models/Category');
const Location = require('../models/Location');
const SystemConfig = require('../models/SystemConfig');

// @desc    Get all active categories
// @route   GET /api/cms/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching categories'
    });
  }
};

// @desc    Get all active locations/cities
// @route   GET /api/cms/locations
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ isMajorCity: -1, name: 1 });
    res.status(200).json({
      success: true,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching locations'
    });
  }
};

// @desc    Get public system config (payment instructions, trial duration)
// @route   GET /api/cms/config
exports.getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    res.status(200).json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching system config'
    });
  }
};
