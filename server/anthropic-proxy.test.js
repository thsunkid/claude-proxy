const request = require('supertest');
const express = require('express');
const app = express();

// Import the route handler
require('./anthropic-proxy')(app);

describe('Anthropic Proxy Server', () => {
  it('should return a response from the Anthropic API', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        model: 'claude-3-opus-20240229',
        temperature: 0.7,
        max_tokens: 1024
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('content');
  });

  it('should handle errors gracefully', async () => {
    // Test with invalid API key
    process.env.ANTHROPIC_API_KEY = 'invalid-key';
    
    const response = await request(app)
      .post('/api/chat')
      .send({
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        model: 'claude-3-opus-20240229'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});
