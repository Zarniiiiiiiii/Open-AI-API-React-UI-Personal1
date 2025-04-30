/**
 * Express Server Configuration
 * This file sets up the backend server and API endpoints
 */

// Import required dependencies
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Debug environment variables
console.log('Environment:', process.env.NODE_ENV);
console.log('API Key present:', !!process.env.REACT_APP_OPENAI_API_KEY);
console.log('API Key length:', process.env.REACT_APP_OPENAI_API_KEY ? process.env.REACT_APP_OPENAI_API_KEY.length : 0);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware configuration
app.use(cors());  // Enable CORS for all routes
app.use(morgan('dev'));  // Log HTTP requests
app.use(express.json());  // Parse JSON request bodies

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

/**
 * Health check endpoint
 * Used to verify the server is running and configured correctly
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    apiKeyPresent: !!process.env.REACT_APP_OPENAI_API_KEY
  });
});

/**
 * OpenAI API proxy endpoint
 * Forwards requests to OpenAI's API while adding authentication
 */
app.post('/api/chat/completions', async (req, res) => {
  try {
    // Validate request format
    if (!req.body || !req.body.messages) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Log request details (excluding sensitive data)
    console.log('Processing chat completion request:', {
      model: req.body.model,
      messageCount: req.body.messages.length
    });

    // Check for OpenAI API key
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Forward request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    // Handle OpenAI API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json(errorData);
    }

    // Return successful response
    const data = await response.json();
    res.json(data);
  } catch (error) {
    // Handle any unexpected errors
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * Global error handling middleware
 * Catches any unhandled errors in the application
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

/**
 * Handle React routing in production
 * Serves the React app for all non-API routes
 */
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Export the Express API for Vercel
module.exports = app;

// Start the server in development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} 