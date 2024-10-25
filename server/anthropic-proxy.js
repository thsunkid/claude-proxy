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
    const { messages, model, temperature, max_tokens } = req.body;
    
    const response = await anthropic.messages.create({
      model: model || 'claude-3-opus-20240229',
      max_tokens: max_tokens || 1024,
      temperature: temperature || 0.7,
      messages: messages,
    });

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
