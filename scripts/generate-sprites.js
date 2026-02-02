#!/usr/bin/env node

/**
 * 🎨 MechaPizza Village - AI Sprite Generator
 * 
 * Génère des sprites pixel art style FF6 avec FAL.AI
 * Usage: node scripts/generate-sprites.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const SPRITES_DIR = path.join(__dirname, '../assets/sprites');
const API_KEY = process.env.FAL_AI_KEY || 'YOUR_FAL_AI_KEY';

// Sprites à générer
const SPRITE_PROMPTS = {
  // Personnages
  'player-default': '16x16 pixel art character sprite, Final Fantasy 6 style, blue tunic, brown hair, facing down, transparent background, game sprite',
  'player-red': '16x16 pixel art character sprite, Final Fantasy 6 style, red tunic, blonde hair, facing down, transparent background, game sprite',
  'player-green': '16x16 pixel art character sprite, Final Fantasy 6 style, green tunic, black hair, facing down, transparent background, game sprite',
  
  // Bâtiments
  'house-basic': '32x32 pixel art house sprite, Final Fantasy 6 style, brown wood walls, red roof, door, transparent background',
  'house-fancy': '32x32 pixel art house sprite, Final Fantasy 6 style, stone walls, blue roof, fancy door, transparent background',
  'shop': '32x32 pixel art shop building, Final Fantasy 6 style, wooden sign, large windows, transparent background',
  'workshop': '32x32 pixel art workshop building, Final Fantasy 6 style, chimney, tools outside, transparent background',
  
  // Environnement
  'tree': '16x16 pixel art tree sprite, Final Fantasy 6 style, green leaves, brown trunk, transparent background',
  'flower': '16x16 pixel art flower sprite, Final Fantasy 6 style, colorful petals, green stem, transparent background',
  'fountain': '32x32 pixel art fountain sprite, Final Fantasy 6 style, stone base, water flowing, transparent background',
  
  // Objets
  'chest': '16x16 pixel art treasure chest sprite, Final Fantasy 6 style, wooden chest, metal locks, transparent background',
  'coin': '16x16 pixel art coin sprite, Final Fantasy 6 style, golden coin, shiny, transparent background',
  'gem': '16x16 pixel art gem sprite, Final Fantasy 6 style, blue crystal, sparkling, transparent background'
};

async function generateSprite(name, prompt) {
  console.log(`🎨 Generating sprite: ${name}`);
  
  try {
    // Appel à FAL.AI pour générer l'image
    const response = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        num_images: 1,
        enable_safety_checker: false,
        output_format: 'png',
        aspect_ratio: '1:1',
        safety_tolerance: '5'
      })
    });

    const data = await response.json();
    
    if (data.status === 'IN_QUEUE') {
      // Attendre que l'image soit générée
      console.log(`⏳ Waiting for ${name}...`);
      const imageData = await waitForCompletion(data.response_url);
      
      if (imageData && imageData.images && imageData.images.length > 0) {
        // Télécharger l'image
        const imageUrl = imageData.images[0].url;
        await downloadImage(imageUrl, path.join(SPRITES_DIR, `${name}.png`));
        console.log(`✅ ${name} generated successfully`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`, error.message);
  }
}

async function waitForCompletion(responseUrl, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(responseUrl, {
        headers: { 'Authorization': `Key ${API_KEY}` }
      });
      const data = await response.json();
      
      if (data.status === 'COMPLETED') {
        return data;
      }
      
      // Attendre 2 secondes avant le prochain check
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error checking status:', error.message);
    }
  }
  
  throw new Error('Timeout waiting for image generation');
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Supprimer le fichier en cas d'erreur
        reject(err);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🍕 MechaPizza Village - AI Sprite Generator');
  console.log('==========================================');
  
  // Créer le dossier sprites s'il n'existe pas
  if (!fs.existsSync(SPRITES_DIR)) {
    fs.mkdirSync(SPRITES_DIR, { recursive: true });
    console.log('📁 Created sprites directory');
  }
  
  if (!API_KEY || API_KEY === 'YOUR_FAL_AI_KEY') {
    console.error('❌ Please set FAL_AI_KEY in your .env file');
    process.exit(1);
  }
  
  console.log(`🎯 Generating ${Object.keys(SPRITE_PROMPTS).length} sprites...`);
  
  // Générer tous les sprites (un par un pour éviter la limite de rate)
  for (const [name, prompt] of Object.entries(SPRITE_PROMPTS)) {
    await generateSprite(name, prompt);
    // Petit délai entre chaque génération
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 All sprites generated successfully!');
  console.log(`📁 Check the ${SPRITES_DIR} directory`);
}

// Vérifier que fetch est disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with fetch support');
  console.error('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

main().catch(console.error);