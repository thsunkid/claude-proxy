# Claude Local Proxy Server

A lightweight proxy server for Anthropic's Claude API that handles authentication and request forwarding.

## Prerequisites

- Node.js (v14 or higher)
- npm
- An Anthropic API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd claude-local
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001  # Optional, defaults to 3001
```

## Development

Run the server in development mode with hot reloading:
```bash
npm run dev
```

## Production Deployment

Start the server in production mode:
```bash
npm start
```

## API Endpoint

The server exposes a single endpoint:

### POST /api/chat

Forwards requests to Claude's API with your authentication.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Your message here"}
  ],
  "model": "claude-3-opus-20240229",  // Optional, defaults to claude-3-opus-20240229
  "temperature": 0.7,                  // Optional, defaults to 0.7
  "max_tokens": 1024                   // Optional, defaults to 1024
}
```

**Response:**
Returns the complete response from Claude's API.

## Testing

Run the test suite:
```bash
npm test
```

## Environment Variables

- `ANTHROPIC_API_KEY`: Your Anthropic API key (required)
- `PORT`: Server port (optional, defaults to 3001)
