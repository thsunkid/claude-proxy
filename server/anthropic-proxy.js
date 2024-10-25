const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Streaming endpoint
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens, timeout, system_prompt } = req.body;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const controller = new AbortController();
    const timeoutId = timeout ? setTimeout(() => {
      controller.abort();
      res.write('data: {"error": "Request timeout"}\n\n');
      res.end();
    }, timeout) : null;

    const stream = await anthropic.messages.create({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: max_tokens || 1024,
      temperature: temperature || 0.7,
      messages: messages,
      system: system_prompt,
      stream: true,
    }, {
      signal: controller.signal
    });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    if (timeoutId) clearTimeout(timeoutId);
    res.end();
  } catch (error) {
    console.error('Anthropic API Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens, timeout, system_prompt } = req.body;
    
    const controller = new AbortController();
    const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;
    
    const response = await anthropic.messages.create({
      model: model || 'claude-3-opus-20240229',
      max_tokens: max_tokens || 1024,
      temperature: temperature || 0.7,
      messages: messages,
      system: system_prompt,
    }, {
      signal: controller.signal
    });

    if (timeoutId) clearTimeout(timeoutId);
    res.json(response);
  } catch (error) {
    console.error('Anthropic API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Anthropic proxy server running on port ${port}`);
  });
}

module.exports = (app) => {
  return app;
};
