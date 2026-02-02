# 🍕 MechaPizza Village

**Un MMORPG social et chill pour la communauté MechaPizzAI**

## 🎮 Concept

MechaPizza Village est un monde virtuel où les membres de la communauté MechaPizzAI peuvent :
- 🏠 Avoir leur propre maison personnalisable
- 💬 Échanger et socialiser en temps réel  
- 🔄 S'échanger des objets et services
- 🤖 Utiliser des "machines" basées sur les workflows n8n
- 🎯 Gagner des tokens en participant à la communauté

## 🚀 Quick Start

### Prérequis
- **Node.js 18+** avec support fetch
- **npm** ou **yarn**
- **Compte Discord Developer** (pour OAuth)

### Installation Express ⚡
```bash
# Cloner le repo
git clone https://github.com/VanLyxe/MechaVillage.git
cd MechaVillage

# Installation rapide et démarrage
chmod +x start.sh
./start.sh
```

### Installation Manuelle 🔧
```bash
# Server
cd server
npm install
npm run dev

# Client (nouveau terminal)
cd client  
npm install
npm run dev
```

### URLs de développement
- 🎮 **Jeu:** http://localhost:5173
- 🖥️ **API:** http://localhost:3000
- 🔐 **Auth Discord:** http://localhost:3000/auth/discord

## 🛠 Stack Technique

- **Frontend:** Phaser 3 + TypeScript + Vite
- **Backend:** Node.js + Express + Socket.io + TypeScript
- **Base de données:** SQLite (dev) → PostgreSQL (prod)
- **Auth:** Discord OAuth Strategy
- **Sprites:** AI-generated (FAL.AI) + Style FF6

## 📁 Structure du Projet

```
mechapizza-village/
├── client/           # Frontend Phaser 3
│   ├── src/
│   │   ├── scenes/   # Scènes de jeu Phaser
│   │   ├── ui/       # Interface utilisateur
│   │   └── main.ts   # Point d'entrée
│   └── index.html    # Page principale
├── server/          # Backend Node.js
│   ├── src/
│   │   ├── game/     # Logique de jeu
│   │   ├── routes/   # Routes API
│   │   ├── database/ # Base de données
│   │   └── index.ts  # Serveur principal
│   └── .env          # Configuration (créé pour toi)
├── scripts/         # Scripts utilitaires
│   └── generate-sprites.js # Générateur de sprites IA
├── assets/          # Images, sons, sprites
└── docs/           # Documentation
```

## ✨ Fonctionnalités Actuelles

### ✅ Implémenté (v0.1)
- 🔐 **Authentification Discord OAuth** - Login sécurisé
- 🎮 **Moteur de jeu Phaser 3** - Rendu 2D performant
- 🚶 **Système de mouvement** - Déplacement sur grille (WASD/flèches)
- 💬 **Chat temps réel** - Communication entre joueurs
- 🏠 **Attribution automatique de maisons** - Une maison par joueur
- 👥 **Multijoueur en temps réel** - Jusqu'à 20 joueurs simultanés
- 🗺️ **Map 50x50** - Village avec chemins et maisons
- 📱 **Interface responsive** - UI adaptée au style FF6

### 🎨 Style & Design
- **Pixel Art Final Fantasy 6** - Esthétique rétro authentique
- **Sprites générés par IA** - FAL.AI pour créer les assets
- **Couleurs authentiques** - Palette FF6 fidèle
- **Animations fluides** - Mouvement sur grille 32x32px

## 🎮 Comment Jouer

1. **Se connecter** avec Discord (clic sur le bouton)
2. **Se déplacer** avec WASD ou les flèches directionnelles
3. **Chatter** en tapant dans la zone de chat (bas-gauche)
4. **Explorer** le village et voir les autres joueurs
5. **Aller à sa maison** (position assignée automatiquement)

## 🤖 Génération de Sprites IA

```bash
# Ajouter votre clé FAL.AI dans server/.env
FAL_AI_KEY=your_fal_ai_key_here

# Générer tous les sprites
node scripts/generate-sprites.js
```

Le script génère automatiquement :
- Sprites de personnages (3 variations)
- Bâtiments (maisons, boutiques, ateliers) 
- Éléments d'environnement (arbres, fontaines)
- Objets (coffres, pièces, gemmes)

## 🚀 Roadmap

### 🔄 v0.2 - Social & Économie (En cours)
- [ ] Système d'inventaire persistent
- [ ] Échanges entre joueurs
- [ ] Tokens MechaPizza (économie interne)
- [ ] Personnalisation des avatars
- [ ] Décoration des maisons

### 🤖 v0.3 - Intégration MechaPizzAI
- [ ] Machines n8n interactives dans le jeu
- [ ] Sync statuts Discord/Telegram
- [ ] Quêtes basées sur la participation communautaire
- [ ] Récompenses pour contributions (workflows, aide)

### 🌍 v1.0 - Production
- [ ] Base de données PostgreSQL
- [ ] Déploiement Docker
- [ ] CDN pour les assets
- [ ] Système de backup
- [ ] Analytics et monitoring

## 🔧 Développement

### Structure Socket.io
```typescript
// Events Client → Server
socket.emit('join_game', userData)
socket.emit('player_move', { x, y })
socket.emit('chat_message', message)

// Events Server → Client  
socket.on('game_state', gameData)
socket.on('player_joined', player)
socket.on('player_moved', { playerId, position })
socket.on('chat_message', chatMessage)
```

### Base de données
- **SQLite** pour le développement (auto-créée)
- **Tables:** users, items, user_items, chat_messages, house_decorations
- **Migration automatique** au démarrage du serveur

### Tests
```bash
npm test                    # Tests unitaires
npm run test:integration    # Tests d'intégration (à venir)
```

## 🚀 Déploiement

### Production Simple
```bash
# Build
npm run build

# Start production server
npm start
```

### Docker (à venir)
```bash
docker-compose up --build
```

## 🐛 Debug & Logs

- **Server logs:** Console avec emojis pour clarity
- **Client debug:** F12 → Console pour Phaser/Socket.io
- **Database:** SQLite Browser pour inspecter `./data/village.db`

## 🔧 Développeurs

- **Julien** - Product Owner & Game Design
- **Bob** - AI Assistant & Full-Stack Development

## 📝 License

MIT - Feel free to contribute!

---

*Made with 🔧 & 🍕 by MechaPizzAI Community*