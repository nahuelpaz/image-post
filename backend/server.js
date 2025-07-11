const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:3000',
      'https://localhost:5173',
      'https://naw-ig.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
  }
});

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps) o desde origins específicos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'https://localhost:3000',
      'https://localhost:5173',
      'https://naw-ig.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean); // Filtrar valores undefined/null
    
    // En desarrollo, permitir cualquier localhost
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || 
        (process.env.NODE_ENV === 'development' && origin?.includes('localhost')) ||
        origin?.includes('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Aumentado a 500 requests por IP por 15 minutos para desarrollo
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Siempre responde con CORS headers
    res.status(429).json({
      message: 'Too many requests, please try again later.'
    });
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create temp directory for file processing
if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp', { recursive: true });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'ImagePost API Server',
    version: '1.0.0',
    status: 'Running'
  });
});

// API Routes - Todas las rutas descomentadas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Mapa para guardar los sockets por usuario
const userSockets = new Map();

io.on('connection', (socket) => {
  // El frontend debe emitir 'join' con el userId después de autenticarse
  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }
  });
});

// Hacer accesible io y userSockets en las rutas
app.set('io', io);
app.set('userSockets', userSockets);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});
