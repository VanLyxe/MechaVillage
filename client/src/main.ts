import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';
import { GameScene } from './scenes/GameScene';
import { UIManager } from './ui/UIManager';

class MechaPizzaVillage {
  private game?: Phaser.Game;
  private socket?: Socket;
  private uiManager: UIManager;
  private currentUser: any = null;

  constructor() {
    this.uiManager = new UIManager();
    this.init();
  }

  private async init() {
    // Check if user is authenticated
    try {
      const response = await fetch('/auth/me');
      if (response.ok) {
        this.currentUser = await response.json();
        this.startGame();
      } else {
        // Show login screen
        this.showLoginScreen();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.showLoginScreen();
    }
  }

  private showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const gameContainer = document.getElementById('game-container');
    
    if (loginScreen) loginScreen.style.display = 'flex';
    if (gameContainer) gameContainer.style.display = 'none';
  }

  private startGame() {
    // Hide login screen
    const loginScreen = document.getElementById('login-screen');
    const gameContainer = document.getElementById('game-container');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'flex';

    // Initialize Phaser game
    this.initPhaser();
    
    // Initialize Socket.io
    this.initSocket();

    // Initialize UI
    this.uiManager.init(this.socket!);
  }

  private initPhaser() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      backgroundColor: '#2d5016', // FF6 grass green
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      pixelArt: true, // Pour le style FF6
      antialias: false
    };

    this.game = new Phaser.Game(config);
    
    // Pass socket and user to game scene when it's ready
    this.game.events.on('ready', () => {
      const gameScene = this.game!.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        gameScene.setSocket(this.socket!);
        gameScene.setCurrentUser(this.currentUser);
      }
    });
  }

  private initSocket() {
    this.socket = io();

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      
      // Join game with user data
      this.socket!.emit('join_game', {
        discordId: this.currentUser.discordId,
        username: this.currentUser.username,
        avatar: this.currentUser.avatar
      });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    this.socket.on('game_state', (data) => {
      console.log('🎮 Received game state');
      // Game scene will handle this
    });

    this.socket.on('chat_message', (message) => {
      this.uiManager.addChatMessage(message);
    });

    this.socket.on('player_joined', (player) => {
      console.log(`👋 ${player.username} joined the game`);
    });

    this.socket.on('player_left', (playerId) => {
      console.log(`👋 Player ${playerId} left the game`);
    });

    this.socket.on('player_moved', (data) => {
      // Game scene will handle player movement
    });
  }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MechaPizzaVillage();
});