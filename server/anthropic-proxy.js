const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens, timeout, stream } = req.body;
    
    // Extract system prompt if present in messages
    const systemMessage = messages.find(m => m.role === 'system');
    const system_prompt = systemMessage?.content;
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const controller = new AbortController();
    const timeoutId = timeout ? setTimeout(() => {
      controller.abort();
      if (stream) {
        res.write('data: {"error": "Request timeout"}\n\n');
        res.end();
      }
    }, timeout) : null;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const stream = await anthropic.messages.create({
          model: model || 'claude-3-haiku-20240307',
          max_tokens: max_tokens || 1024,
          temperature: temperature || 0.7,
          messages: conversationMessages,
          system: system_prompt,
          stream: true,
        }, {
          signal: controller.signal
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta') {
            const data = {
              type: 'content',
              content: chunk.delta?.text || ''
            };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        if (timeoutId) clearTimeout(timeoutId);
        res.end();
      } catch (streamError) {
        console.error('Streaming Error:', streamError);
        res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
        res.end();
      }
    } else {
      const response = await anthropic.messages.create({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: max_tokens || 1024,
        temperature: temperature || 0.7,
        messages: conversationMessages,
        system: system_prompt,
      }, {
        signal: controller.signal
      });

      if (timeoutId) clearTimeout(timeoutId);
      res.json(response);
    }
  } catch (error) {
    console.error('Anthropic API Error:', error);
    if (stream) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: error.message });
    }
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
