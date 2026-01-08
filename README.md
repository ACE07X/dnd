# D&D Tabletop RPG

A high-quality multiplayer online tabletop RPG (D&D-style) built with React, Node.js, Express, and Socket.IO, deployed on Railway.

## Features

- **Multiplayer Rooms**: Create or join game rooms via room ID
- **Turn-Based Gameplay**: Server-authoritative turn system
- **Grid-Based Map**: Interactive 20x20 grid with token movement
- **Real-Time Sync**: Live updates for all players via Socket.IO
- **Dice Rolling**: Server-side dice rolls (d20, d12, d10, d8, d6, d4)
- **Chat System**: In-game chat with system messages
- **AI Integration**: OpenAI API for area descriptions and NPC dialogue (narration only)
- **Dark Fantasy Theme**: Clean, minimal UI with dark theme

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Realtime**: Socket.IO
- **AI**: OpenAI API (text only, narration only)
- **Deployment**: Railway

## Architecture

```
/
├── server/          # Backend server
│   ├── index.js     # Express + Socket.IO server
│   ├── rooms.js     # Room & player state management
│   ├── gameLogic.js # Turn-based game logic
│   ├── ai.js        # OpenAI integration
│   └── socketHandler.js # Socket.IO event handlers
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameRoom.jsx
│   │   │   ├── Map.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Dice.jsx
│   │   │   └── TopBar.jsx
│   │   └── App.jsx
│   └── package.json
└── package.json     # Root package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (optional, for AI features)

### Local Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   
   Create `server/.env`:
   ```env
   PORT=3000
   CLIENT_URL=http://localhost:5173
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   Create `client/.env`:
   ```env
   VITE_SERVER_URL=http://localhost:3000
   ```

3. **Start development servers**:
   
   Terminal 1 (Server):
   ```bash
   npm run dev:server
   ```
   
   Terminal 2 (Client):
   ```bash
   npm run dev:client
   ```

4. **Open the app**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

### Building for Production

```bash
npm run build:client
```

The built files will be in `client/dist/`.

## Railway Deployment

### Prerequisites

1. Railway account (https://railway.app)
2. Railway CLI (optional, for local testing)

### Deploy Steps

1. **Create a new Railway project**

2. **Connect your repository** or deploy directly

3. **Set environment variables** in Railway dashboard:
   - `PORT`: Will be set automatically by Railway
   - `CLIENT_URL`: Your Railway frontend URL (if separate) or use the same URL
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)

4. **Deploy**:
   - Railway will automatically detect the `Procfile` or use the start command from `package.json`
   - Build command: `npm run install:all && npm run build:client`
   - Start command: `cd server && node index.js`

5. **Optional: Serve static frontend**:
   - For production, you may want to serve the built React app from Express
   - Add static file serving in `server/index.js`:
     ```js
     import path from 'path';
     import { fileURLToPath } from 'url';
     
     const __filename = fileURLToPath(import.meta.url);
     const __dirname = path.dirname(__filename);
     
     // Serve static files from client build
     app.use(express.static(path.join(__dirname, '../client/dist')));
     
     // Fallback to React app for client-side routing
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../client/dist/index.html'));
     });
     ```

### Railway Configuration

The project includes:
- `railway.json`: Railway configuration
- `Procfile`: Process file for Railway deployment

## Game Rules

- **Server Authority**: All game logic is server-authoritative. Clients send actions, server validates and broadcasts.
- **Turn System**: Players take turns in order. Only the current player can move or end their turn.
- **Movement**: Players can move to any unoccupied cell on their turn.
- **Dice Rolls**: All dice rolls are generated on the server and visible to all players.
- **AI Usage**: AI is only used for narration (area descriptions, NPC dialogue). It never affects game state.

## API Endpoints

### WebSocket Events (Socket.IO)

**Client → Server:**
- `createRoom({ playerName })` - Create a new game room
- `joinRoom({ roomId, playerName })` - Join an existing room
- `gameAction({ action, data })` - Perform game action (move, rollDice, endTurn)
- `chatMessage({ message })` - Send a chat message

**Server → Client:**
- `roomCreated(room)` - Room created successfully
- `roomJoined(room)` - Joined room successfully
- `roomState(state)` - Current room state update
- `systemMessage({ message, timestamp })` - System notification
- `chatMessage({ player, message, timestamp })` - Chat message
- `diceRoll({ playerId, playerName, dice, count, rolls, total, timestamp })` - Dice roll result
- `error({ message })` - Error occurred

### HTTP Endpoints

- `GET /health` - Health check
- `POST /api/ai/area-description` - Generate area description (requires OpenAI API key)
- `POST /api/ai/npc-dialogue` - Generate NPC dialogue (requires OpenAI API key)

## Development Notes

- The server uses in-memory storage for rooms. In production, consider using Redis or a database.
- Socket.IO CORS is configured for local development. Update for production.
- AI features require an OpenAI API key but have fallbacks if not provided.

## License

MIT