import { Server, Socket } from 'socket.io';

export interface Player {
  id: string;
  discordId: string;
  username: string;
  avatar?: string;
  position: { x: number; y: number };
  house?: { x: number; y: number };
  online: boolean;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system';
}

export class GameServer {
  private io: Server;
  private players: Map<string, Player> = new Map();
  private chatHistory: ChatMessage[] = [];
  private readonly MAX_CHAT_HISTORY = 100;

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('🔌 Socket connected:', socket.id);

      // Player joins the game
      socket.on('join_game', (userData: any) => {
        this.handlePlayerJoin(socket, userData);
      });

      // Player moves
      socket.on('player_move', (position: { x: number; y: number }) => {
        this.handlePlayerMove(socket, position);
      });

      // Chat message
      socket.on('chat_message', (message: string) => {
        this.handleChatMessage(socket, message);
      });

      // Player disconnects
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket);
      });
    });
  }

  private handlePlayerJoin(socket: Socket, userData: any) {
    const player: Player = {
      id: socket.id,
      discordId: userData.discordId,
      username: userData.username,
      avatar: userData.avatar,
      position: this.getSpawnPosition(),
      house: this.assignHouse(userData.discordId),
      online: true,
      joinedAt: new Date()
    };

    this.players.set(socket.id, player);

    // Send game state to new player
    socket.emit('game_state', {
      player: player,
      players: Array.from(this.players.values()),
      chatHistory: this.chatHistory.slice(-20) // Last 20 messages
    });

    // Notify other players
    socket.broadcast.emit('player_joined', player);

    // System message
    this.broadcastSystemMessage(`🎮 ${player.username} a rejoint le village !`);

    console.log(`🎮 Player joined: ${player.username} (${this.players.size}/${process.env.MAX_PLAYERS || 20})`);
  }

  private handlePlayerMove(socket: Socket, position: { x: number; y: number }) {
    const player = this.players.get(socket.id);
    if (!player) return;

    // Validate position (basic bounds checking)
    const mapWidth = parseInt(process.env.MAP_WIDTH || '50');
    const mapHeight = parseInt(process.env.MAP_HEIGHT || '50');
    
    if (position.x < 0 || position.x >= mapWidth || position.y < 0 || position.y >= mapHeight) {
      return; // Invalid position
    }

    player.position = position;
    
    // Broadcast to other players
    socket.broadcast.emit('player_moved', {
      playerId: player.id,
      position: position
    });
  }

  private handleChatMessage(socket: Socket, message: string) {
    const player = this.players.get(socket.id);
    if (!player || !message.trim()) return;

    // Basic message validation
    if (message.length > 200) {
      socket.emit('chat_error', 'Message trop long (max 200 caractères)');
      return;
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      playerId: player.id,
      username: player.username,
      message: message.trim(),
      timestamp: new Date(),
      type: 'chat'
    };

    // Add to history
    this.chatHistory.push(chatMessage);
    if (this.chatHistory.length > this.MAX_CHAT_HISTORY) {
      this.chatHistory = this.chatHistory.slice(-this.MAX_CHAT_HISTORY);
    }

    // Broadcast to all players
    this.io.emit('chat_message', chatMessage);

    console.log(`💬 ${player.username}: ${message}`);
  }

  private handlePlayerDisconnect(socket: Socket) {
    const player = this.players.get(socket.id);
    if (!player) return;

    this.players.delete(socket.id);
    
    // Notify other players
    socket.broadcast.emit('player_left', player.id);
    
    // System message
    this.broadcastSystemMessage(`👋 ${player.username} a quitté le village`);

    console.log(`👋 Player left: ${player.username} (${this.players.size}/${process.env.MAX_PLAYERS || 20})`);
  }

  private getSpawnPosition(): { x: number; y: number } {
    // Spawn in the center area with some randomness
    const centerX = Math.floor((parseInt(process.env.MAP_WIDTH || '50')) / 2);
    const centerY = Math.floor((parseInt(process.env.MAP_HEIGHT || '50')) / 2);
    
    return {
      x: centerX + Math.floor(Math.random() * 6) - 3, // ±3 tiles from center
      y: centerY + Math.floor(Math.random() * 6) - 3
    };
  }

  private assignHouse(discordId: string): { x: number; y: number } {
    // Simple house assignment - in a real game, this would be stored in DB
    // Hash discord ID to get consistent house position
    let hash = 0;
    for (let i = 0; i < discordId.length; i++) {
      hash = ((hash << 5) - hash + discordId.charCodeAt(i)) & 0xffffffff;
    }
    
    const houseIndex = Math.abs(hash) % 20; // 20 houses max for now
    const housesPerRow = 5;
    
    return {
      x: 5 + (houseIndex % housesPerRow) * 8, // Houses spaced 8 tiles apart
      y: 5 + Math.floor(houseIndex / housesPerRow) * 8
    };
  }

  private broadcastSystemMessage(message: string) {
    const systemMessage: ChatMessage = {
      id: `sys_${Date.now()}`,
      playerId: 'system',
      username: 'Système',
      message,
      timestamp: new Date(),
      type: 'system'
    };

    this.chatHistory.push(systemMessage);
    this.io.emit('chat_message', systemMessage);
  }

  public getPlayerCount(): number {
    return this.players.size;
  }

  public getPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}