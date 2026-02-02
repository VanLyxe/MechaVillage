import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

interface Player {
  id: string;
  discordId: string;
  username: string;
  avatar?: string;
  position: { x: number; y: number };
  house?: { x: number; y: number };
}

export class GameScene extends Phaser.Scene {
  private socket?: Socket;
  private currentUser: any;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: any;
  private playerSprite?: Phaser.Physics.Arcade.Sprite;
  private otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private nameTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  
  private tileSize = 32;
  private mapWidth = 50;
  private mapHeight = 50;
  
  private lastMoveTime = 0;
  private moveDelay = 100; // ms between moves

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create simple colored rectangles as temporary sprites (FF6 style)
    this.createTempSprites();
    
    // TODO: Load AI-generated sprites here later
  }

  create() {
    // Create the world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
    
    // Create simple grid background
    this.createBackground();
    
    // Create houses
    this.createHouses();
    
    // Setup camera
    this.cameras.main.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
    
    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // Setup socket listeners
    this.setupSocketListeners();
  }

  private createTempSprites() {
    // Create temporary colored rectangles for sprites
    
    // Player sprite (blue square)
    this.add.graphics()
      .fillStyle(0x4169E1)
      .fillRect(0, 0, this.tileSize - 4, this.tileSize - 4)
      .generateTexture('player', this.tileSize - 4, this.tileSize - 4);
    
    // Other player sprite (green square)
    this.add.graphics()
      .fillStyle(0x32CD32)
      .fillRect(0, 0, this.tileSize - 4, this.tileSize - 4)
      .generateTexture('other_player', this.tileSize - 4, this.tileSize - 4);
    
    // House sprite (brown rectangle)
    this.add.graphics()
      .fillStyle(0x8B4513)
      .fillRect(0, 0, this.tileSize * 2, this.tileSize * 2)
      .generateTexture('house', this.tileSize * 2, this.tileSize * 2);
    
    // Grass tile (green)
    this.add.graphics()
      .fillStyle(0x228B22)
      .fillRect(0, 0, this.tileSize, this.tileSize)
      .generateTexture('grass', this.tileSize, this.tileSize);
    
    // Path tile (light brown)
    this.add.graphics()
      .fillStyle(0xDEB887)
      .fillRect(0, 0, this.tileSize, this.tileSize)
      .generateTexture('path', this.tileSize, this.tileSize);
  }

  private createBackground() {
    // Create a simple grass background with some paths
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        // Main paths (cross pattern)
        const isMainPath = (x === Math.floor(this.mapWidth / 2)) || (y === Math.floor(this.mapHeight / 2));
        const texture = isMainPath ? 'path' : 'grass';
        
        this.add.image(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, texture);
      }
    }
  }

  private createHouses() {
    // Create some houses around the edges
    const housePositions = [
      { x: 5, y: 5 }, { x: 13, y: 5 }, { x: 21, y: 5 }, { x: 29, y: 5 }, { x: 37, y: 5 },
      { x: 5, y: 13 }, { x: 13, y: 13 }, { x: 21, y: 13 }, { x: 29, y: 13 }, { x: 37, y: 13 },
      { x: 5, y: 37 }, { x: 13, y: 37 }, { x: 21, y: 37 }, { x: 29, y: 37 }, { x: 37, y: 37 },
      { x: 5, y: 29 }, { x: 13, y: 29 }, { x: 21, y: 29 }, { x: 29, y: 29 }, { x: 37, y: 29 }
    ];

    housePositions.forEach(pos => {
      this.add.image(pos.x * this.tileSize, pos.y * this.tileSize, 'house')
        .setOrigin(0, 0);
    });
  }

  update() {
    if (!this.playerSprite || !this.socket) return;

    // Handle player movement
    const now = Date.now();
    if (now - this.lastMoveTime > this.moveDelay) {
      let moved = false;
      let newX = this.playerSprite.x;
      let newY = this.playerSprite.y;

      if (this.cursors!.left.isDown || this.wasd.A.isDown) {
        newX -= this.tileSize;
        moved = true;
      } else if (this.cursors!.right.isDown || this.wasd.D.isDown) {
        newX += this.tileSize;
        moved = true;
      }

      if (this.cursors!.up.isDown || this.wasd.W.isDown) {
        newY -= this.tileSize;
        moved = true;
      } else if (this.cursors!.down.isDown || this.wasd.S.isDown) {
        newY += this.tileSize;
        moved = true;
      }

      if (moved) {
        // Check bounds
        const tileX = Math.floor(newX / this.tileSize);
        const tileY = Math.floor(newY / this.tileSize);
        
        if (tileX >= 0 && tileX < this.mapWidth && tileY >= 0 && tileY < this.mapHeight) {
          this.playerSprite.setPosition(newX, newY);
          this.lastMoveTime = now;
          
          // Send position to server
          this.socket.emit('player_move', { x: tileX, y: tileY });
          
          // Update UI
          this.updatePlayerInfo(tileX, tileY);
        }
      }
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('game_state', (data) => {
      this.handleGameState(data);
    });

    this.socket.on('player_joined', (player: Player) => {
      this.addOtherPlayer(player);
    });

    this.socket.on('player_left', (playerId: string) => {
      this.removeOtherPlayer(playerId);
    });

    this.socket.on('player_moved', (data: { playerId: string; position: { x: number; y: number } }) => {
      this.moveOtherPlayer(data.playerId, data.position);
    });
  }

  private handleGameState(data: any) {
    const { player, players } = data;
    
    // Create current player sprite
    this.playerSprite = this.physics.add.sprite(
      player.position.x * this.tileSize,
      player.position.y * this.tileSize,
      'player'
    );
    this.playerSprite.setCollideWorldBounds(true);
    
    // Follow player with camera
    this.cameras.main.startFollow(this.playerSprite);
    
    // Add other players
    players.forEach((p: Player) => {
      if (p.id !== player.id) {
        this.addOtherPlayer(p);
      }
    });
    
    // Update UI
    this.updatePlayerInfo(player.position.x, player.position.y);
    this.updateOnlineCount(players.length);
  }

  private addOtherPlayer(player: Player) {
    if (this.otherPlayers.has(player.id)) return;
    
    const sprite = this.physics.add.sprite(
      player.position.x * this.tileSize,
      player.position.y * this.tileSize,
      'other_player'
    );
    
    // Add name tag
    const nameText = this.add.text(
      player.position.x * this.tileSize,
      player.position.y * this.tileSize - 20,
      player.username,
      {
        fontSize: '12px',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }
    ).setOrigin(0.5, 1);
    
    this.otherPlayers.set(player.id, sprite);
    this.nameTexts.set(player.id, nameText);
  }

  private removeOtherPlayer(playerId: string) {
    const sprite = this.otherPlayers.get(playerId);
    const nameText = this.nameTexts.get(playerId);
    
    if (sprite) {
      sprite.destroy();
      this.otherPlayers.delete(playerId);
    }
    
    if (nameText) {
      nameText.destroy();
      this.nameTexts.delete(playerId);
    }
  }

  private moveOtherPlayer(playerId: string, position: { x: number; y: number }) {
    const sprite = this.otherPlayers.get(playerId);
    const nameText = this.nameTexts.get(playerId);
    
    if (sprite) {
      // Smooth movement
      this.tweens.add({
        targets: sprite,
        x: position.x * this.tileSize,
        y: position.y * this.tileSize,
        duration: this.moveDelay,
        ease: 'Power1'
      });
    }
    
    if (nameText) {
      this.tweens.add({
        targets: nameText,
        x: position.x * this.tileSize,
        y: position.y * this.tileSize - 20,
        duration: this.moveDelay,
        ease: 'Power1'
      });
    }
  }

  private updatePlayerInfo(x: number, y: number) {
    const playerNameEl = document.getElementById('player-name');
    const playerPosEl = document.getElementById('player-position');
    
    if (playerNameEl && this.currentUser) {
      playerNameEl.textContent = `🎮 ${this.currentUser.username}`;
    }
    
    if (playerPosEl) {
      playerPosEl.textContent = `Position: (${x}, ${y})`;
    }
  }

  private updateOnlineCount(count: number) {
    const onlineCountEl = document.getElementById('online-count');
    if (onlineCountEl) {
      onlineCountEl.textContent = `Joueurs: ${count}`;
    }
  }

  public setSocket(socket: Socket) {
    this.socket = socket;
  }

  public setCurrentUser(user: any) {
    this.currentUser = user;
  }
}