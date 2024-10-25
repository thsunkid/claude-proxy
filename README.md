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

### Endpoint

#### POST /api/chat

Forwards requests to Claude's API with your authentication. Supports both streaming and non-streaming responses.

**Request Body:**
```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},  // Optional system message
    {"role": "user", "content": "Your message here"}
  ],
  "model": "claude-3-haiku-20240307",  // Optional, defaults to claude-3-haiku-20240307
  "temperature": 0.7,                   // Optional, defaults to 0.7
  "max_tokens": 1024,                  // Optional, defaults to 1024
  "timeout": 30000,                    // Optional, request timeout in milliseconds
  "stream": false                      // Optional, set to true for streaming response
}
```

**Response:**
When `stream: false` (default): Returns the complete response from Claude's API.
When `stream: true`: Returns a stream of SSE events containing chunks of Claude's response.

## Testing

Run the test suite:
```bash
npm test
```

## Environment Variables

- `ANTHROPIC_API_KEY`: Your Anthropic API key (required)
- `PORT`: Server port (optional, defaults to 3001)

## Usage Examples

### cURL Examples

Regular request:
```bash
curl -X POST "http://localhost:3001/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"system","content":"You are a helpful assistant"},{"role":"user","content":"What is the capital of France?"}],"model":"claude-3-haiku-20240307","temperature":0.7,"max_tokens":1024,"stream":false}'
```

Streaming request:
```bash
curl -N "http://localhost:3001/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"system","content":"You are a helpful assistant"},{"role":"user","content":"What is the capital of France?"}],"stream":true}'
```

### React.js Examples

Regular endpoint:
```jsx
const sendMessage = async (userMessage, systemPrompt, stream = false) => {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'claude-3-haiku-20240307',
        temperature: 0.7,
        max_tokens: 1024,
        timeout: 30000,
        stream
      })
    });

    if (!stream) {
      const data = await response.json();
      return data;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          onChunk(data);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Example usage in a React component
function ChatComponent() {
  const [response, setResponse] = useState('');

  const handleMessage = async (streaming = false) => {
    try {
      if (streaming) {
        await sendMessage(
          'What is the capital of France?',
          'You are a helpful assistant',
          true,
          (chunk) => {
            setResponse(prev => prev + chunk.content);
          }
        );
      } else {
        const data = await sendMessage(
          'What is the capital of France?',
          'You are a helpful assistant',
          false
        );
        setResponse(data.content);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div>
      <button onClick={() => handleMessage(false)}>Send Regular Message</button>
      <button onClick={() => handleMessage(true)}>Send Streaming Message</button>
      <div>{response}</div>
    </div>
  );
}
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          onChunk(data);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage in a React component
function ChatComponent() {
  const [response, setResponse] = useState('');

  const handleStreamMessage = async () => {
    try {
      await streamMessage(
        'What is the capital of France?',
        'You are a helpful assistant',
        (chunk) => {
          setResponse(prev => prev + chunk.content);
        }
      );
    } catch (error) {
      console.error('Failed to stream message:', error);
    }
  };

  return (
    <div>
      <button onClick={handleStreamMessage}>Send Message</button>
      <div>{response}</div>
    </div>
  );
}
```
