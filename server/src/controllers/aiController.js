const { generateChatResponse, executeGetPlatformStats } = require('../services/aiAgentService');

/**
 * Handle incoming chat messages for the AI Chatbot Agent
 * POST /api/ai/chat
 */
exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid message string is required.'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum length of 2000 characters.'
      });
    }

    const response = await generateChatResponse({
      message: message.trim(),
      history: Array.isArray(history) ? history : []
    });

    return res.status(200).json({
      success: true,
      reply: response.reply,
      source: response.source
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI chat inquiry. Please try again in a moment.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Health check & status of AI Agent
 * GET /api/ai/health
 */
exports.health = async (req, res) => {
  try {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const stats = await executeGetPlatformStats();

    return res.status(200).json({
      success: true,
      status: 'active',
      engine: hasGeminiKey ? 'gemini-2.5-flash-grounded' : 'database-rule-engine',
      hasGeminiKey,
      stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message
    });
  }
};
