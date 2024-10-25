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

## Usage Examples

### cURL
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "model": "claude-3-opus-20240229",
    "temperature": 0.7,
    "max_tokens": 1024
  }'
```

### React.js
```jsx
// Example using fetch
const sendMessage = async (userMessage) => {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: userMessage }
        ],
        model: 'claude-3-opus-20240229',
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage in a React component
function ChatComponent() {
  const [response, setResponse] = useState('');

  const handleSendMessage = async () => {
    try {
      const result = await sendMessage('What is the capital of France?');
      setResponse(result.content[0].text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSendMessage}>Send Message</button>
      <div>{response}</div>
    </div>
  );
}
```
