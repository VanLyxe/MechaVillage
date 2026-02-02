import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import modules
import { initDatabase } from './database/init';
import { GameServer } from './game/GameServer';
import { authRoutes } from './routes/auth';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Pour le développement
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'mechapizza-village-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true pour HTTPS en prod
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Discord OAuth Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  callbackURL: process.env.DISCORD_REDIRECT_URI!,
  scope: ['identify', 'email', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // TODO: Save user to database
    const user = {
      discordId: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
      email: profile.email
    };
    
    console.log('🎮 User logged in:', user.username);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.discordId);
});

passport.deserializeUser(async (discordId: string, done) => {
  try {
    // TODO: Fetch user from database
    done(null, { discordId });
  } catch (error) {
    done(error);
  }
});

// Routes
app.use('/auth', authRoutes);

// Serve static files (client build)
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Game server instance
const gameServer = new GameServer(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    players: gameServer.getPlayerCount()
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    console.log('📦 Database initialized');
    
    // Start server
    server.listen(PORT, () => {
      console.log('🍕 MechaPizza Village Server');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🎮 Max players: ${process.env.MAX_PLAYERS || 20}`);
      console.log(`🗺️  Map size: ${process.env.MAP_WIDTH || 50}x${process.env.MAP_HEIGHT || 50}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();