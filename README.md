# 🍕 MechaPizza Village

**Un MMORPG social et chill pour la communauté MechaPizzAI**

## 🎮 Concept

MechaPizza Village est un monde virtuel où les membres de la communauté MechaPizzAI peuvent :
- 🏠 Avoir leur propre maison personnalisable
- 💬 Échanger et socialiser en temps réel  
- 🔄 S'échanger des objets et services
- 🤖 Utiliser des "machines" basées sur les workflows n8n
- 🎯 Gagner des tokens en participant à la communauté

## 🛠 Stack Technique

- **Frontend:** Phaser 3 + TypeScript
- **Backend:** Node.js + Express + Socket.io
- **Base de données:** SQLite → PostgreSQL 
- **Auth:** Discord OAuth
- **Deploy:** VPS → Docker + Kubernetes

## 📁 Structure du Projet

```
mechapizza-village/
├── client/           # Frontend Phaser 3
├── server/          # Backend Node.js
├── shared/          # Code partagé (types, constants)
├── assets/          # Images, sons, sprites
├── docs/           # Documentation
└── docker/         # Configuration Docker
```

## 🚀 Roadmap

### MVP v0.1
- [ ] Connexion Discord OAuth
- [ ] Avatar basique + mouvement
- [ ] Chat temps réel
- [ ] Maisons individuelles
- [ ] Place centrale

### v0.2 - Social
- [ ] Système d'échange
- [ ] Inventaires
- [ ] Personnalisation avatars
- [ ] Économie tokens MechaPizza

### v0.3 - Intégration
- [ ] Machines n8n dans le jeu
- [ ] Sync avec Discord/Telegram
- [ ] Projets collaboratifs

## 🔧 Développeurs

- **Julien** - Product Owner & Architecture
- **Bob** - Assistant IA & Development

---

*Made with 🔧 by MechaPizzAI Community*