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

const Page = require('../models/Page');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all CMS pages
// @route   GET /api/cms/pages
exports.getAllPages = async (req, res) => {
  try {
    const pages = await Page.find({}).select('slug title subtitle metaDescription updatedAt');
    res.status(200).json({
      success: true,
      pages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pages'
    });
  }
};

// @desc    Get single CMS page by slug
// @route   GET /api/cms/pages/:slug
exports.getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    res.status(200).json({
      success: true,
      page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching page'
    });
  }
};

// @desc    Submit contact us inquiry
// @route   POST /api/cms/contact
exports.submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Find admin user to notify
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await Notification.create({
        recipient: adminUser._id,
        title: `New Inquiry from ${name}: ${subject || 'General Inquiry'}`,
        message: `Contact: ${email} | Phone: ${phone || 'N/A'}\nMessage: ${message}`,
        type: 'system',
        link: '/admin/pages'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been received! Our support team in Lahore will respond promptly.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting contact inquiry'
    });
  }
};

// @desc    Live Email & DB Diagnostic
// @route   GET /api/cms/diagnose-email
exports.diagnoseEmail = async (req, res) => {
  const targetEmail = req.query.to || 'abdulkhaliqwebdeveloper@gmail.com';
  const { sendEmailDetailed } = require('../utils/emailService');
  const mongoose = require('mongoose');

  const diag = {
    targetEmail,
    dbHost: mongoose.connection.host,
    dbName: mongoose.connection.name,
    isAtlas: (mongoose.connection.host || '').includes('mongodb.net'),
    envUser: process.env.SMTP_USER || 'default fallback',
    hasEnvPass: !!(process.env.SMTP_PASS),
  };

  try {
    const result = await sendEmailDetailed({
      to: targetEmail,
      subject: 'IlmPortal Diagnostic Test Email',
      html: '<p>This is a live diagnostic email from IlmPortal backend.</p>',
      text: 'This is a live diagnostic email from IlmPortal backend.'
    });
    diag.result = result;
    res.status(200).json({ success: true, diag });
  } catch (err) {
    diag.error = err.message;
    diag.code = err.code;
    diag.stack = err.stack;
    res.status(500).json({ success: false, diag });
  }
};
