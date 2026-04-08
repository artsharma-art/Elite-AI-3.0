const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Hugging Face API Key
const HF_API_KEY = process.env.HF_API_KEY || '';

// Bot configurations
const botConfigs = {
  math: {
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    systemPrompt: 'You are a helpful math tutor. Explain math concepts clearly with step-by-step solutions.'
  },
  history: {
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    systemPrompt: 'You are a knowledgeable history teacher. Provide accurate historical information with context.'
  },
  reading: {
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    systemPrompt: 'You are a reading comprehension expert. Help analyze texts and answer questions.'
  },
  writing: {
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    systemPrompt: 'You are a writing coach. Help with essays, creative writing, and grammar.'
  },
  language: {
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    systemPrompt: 'You are a language learning expert. Help with vocabulary, grammar, and translations.'
  },
  coding: {
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    systemPrompt: 'You are an expert programmer. Help with coding problems and debugging.'
  },
  science: {
    model: 'mistralai/Mistral-7B-Instruct-v0.1',
    systemPrompt: 'You are a science educator. Explain scientific concepts clearly with examples.'
  }
};

// API Route: Send message to AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, bot } = req.body;

    if (!message || !bot) {
      return res.status(400).json({ error: 'Message and bot type required' });
    }

    const botConfig = botConfigs[bot];
    if (!botConfig) {
      return res.status(400).json({ error: 'Invalid bot type' });
    }

    // Call Hugging Face API
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${botConfig.model}`,
      {
        inputs: `${botConfig.systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
        parameters: {
          max_length: 300,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`
        }
      }
    );

    let botResponse = response.data[0]?.generated_text || 'I\'m thinking about that...';
    
    // Clean up response
    botResponse = botResponse.split('Assistant:')[1]?.trim() || botResponse;
    botResponse = botResponse.replace(message, '').trim();

    res.json({ response: botResponse });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get response',
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
});
