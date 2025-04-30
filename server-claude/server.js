const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.CLAUDE_SERVER_PORT || 3002;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'claude-api',
        timestamp: new Date().toISOString(),
        apiKeyPresent: !!process.env.ANTHROPIC_API_KEY
    });
});

// Claude completion endpoint
app.post('/api/claude/chat', async (req, res) => {
    try {
        const { model, messages } = req.body;
        
        // Map our model IDs to Claude's model names
        const modelMap = {
            'claude-3-opus-20240229': 'claude-3-opus-20240229',
            'claude-3-sonnet-20240229': 'claude-3-sonnet-20240229'
        };

        const claudeModel = modelMap[model];
        if (!claudeModel) {
            throw new Error(`Invalid model: ${model}`);
        }

        const response = await anthropic.messages.create({
            model: claudeModel,
            messages: messages,
            max_tokens: 1024,
        });

        res.json({
            success: true,
            response: response.content[0].text,
            usage: {
                total_tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0
            }
        });

    } catch (error) {
        console.error('Claude API error:', error);
        let errorMessage = error.message;
        
        // Try to extract more detailed error information
        try {
            const errorResponse = JSON.parse(error.message);
            if (errorResponse.error && errorResponse.error.message) {
                errorMessage = errorResponse.error.message;
            }
        } catch (e) {
            // If parsing fails, keep the original error message
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: {
                model: claudeModel,
                timestamp: new Date().toISOString(),
                apiKeyPresent: !!process.env.ANTHROPIC_API_KEY
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Claude server running on port ${PORT}`);
}); 