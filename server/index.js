import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { handleConnection } from './socketHandler.js';
import { generateAreaDescription, generateNPCDialogue } from './ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || process.env.RAILWAY_STATIC_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.RAILWAY_STATIC_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AI endpoints (narration only, never affects game state)
app.post('/api/ai/area-description', async (req, res) => {
  try {
    const { areaName, context } = req.body;
    if (!areaName) {
      return res.status(400).json({ error: 'Area name is required' });
    }
    const description = await generateAreaDescription(areaName, context || {});
    res.json({ description });
  } catch (error) {
    console.error('AI endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

app.post('/api/ai/npc-dialogue', async (req, res) => {
  try {
    const { npcName, playerMessage, npcContext } = req.body;
    if (!npcName || !playerMessage) {
      return res.status(400).json({ error: 'NPC name and player message are required' });
    }
    const dialogue = await generateNPCDialogue(npcName, playerMessage, npcContext || {});
    res.json({ dialogue });
  } catch (error) {
    console.error('AI endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate dialogue' });
  }
});

// Serve static files from React build (production) - must be after API routes
const clientDistPath = path.join(__dirname, '../client/dist');
if (process.env.NODE_ENV === 'production' && existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  
  // Fallback to React app for client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes and Socket.IO
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  handleConnection(socket, io);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});