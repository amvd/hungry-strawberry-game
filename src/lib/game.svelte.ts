import { CONFIG } from './config.svelte';
import type { Enemy, Butterfly, GameState } from './types';
import { AudioEngine } from './audio.svelte';

export class GameEngine {
  // State
  gameState = $state<GameState>('start');
  score = $state(0);
  highScore = $state(0);
  timeElapsed = $state(0);
  spawnTimer = $state(0);
  
  // Entities
  enemies = $state<Enemy[]>([]);
  butterflies = $state<Butterfly[]>([]);
  
  // Player
  playerY = $state(0);
  playerSize = $state(CONFIG.PLAYER.START_SIZE);
  
  // Dimensions (passed from View)
  width = $state(800);
  height = $state(600);
  
  // Derived
  scale = $derived(Math.max(0.4, Math.min(1.5, this.width / CONFIG.GAME.WIDTH)));
  playerHeight = $derived(this.playerSize / CONFIG.PLAYER.ASPECT_RATIO);
  
  private audio = new AudioEngine();
  private nextEnemyId = 0;
  private nextButterflyId = 0;
  private butterflyTimer = 0;

  constructor() {
    const saved = localStorage.getItem('hungry_strawberry_highscore');
    if (saved) this.highScore = parseInt(saved);
  }

  start() {
    this.audio.init();
    if (navigator.vibrate && CONFIG.GAME.HAPTICS.ENABLED) navigator.vibrate(50);
    
    this.gameState = 'playing';
    this.playerSize = CONFIG.PLAYER.START_SIZE * this.scale;
    this.playerY = (this.height - this.playerHeight) / 2;
    this.enemies = [];
    this.score = 0;
    this.timeElapsed = 0;
    this.spawnTimer = 0;
  }

  update(deltaTime: number) {
    const speedFactor = deltaTime / (1000 / 60);
    this.audio.updateMusic(deltaTime);

    if (CONFIG.GAME.BUTTERFLIES.ENABLED) {
      this.updateButterflies(deltaTime, speedFactor);
    }

    if (this.gameState !== 'playing') {
      if (this.gameState === 'start') this.timeElapsed += deltaTime;
      return;
    }

    this.timeElapsed += deltaTime;
    this.spawnTimer += deltaTime;

    if (this.timeElapsed >= CONFIG.GAME.WIN_TIME_MS) {
      this.endGame('won');
      return;
    }

    if (this.spawnTimer > CONFIG.GAME.SPAWN_INTERVAL_MS) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    this.updateEnemies(speedFactor);
  }

  private updateEnemies(speedFactor: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.isEaten) {
        const targetX = CONFIG.PLAYER.X_POSITION + this.playerSize * 0.75;
        const targetY = this.playerY + this.playerHeight * 0.5;

        enemy.width *= Math.pow(0.8, speedFactor);
        enemy.height *= Math.pow(0.8, speedFactor);
        enemy.x += (targetX - (enemy.x + enemy.width / 2)) * (1 - Math.pow(0.7, speedFactor));
        enemy.y += (targetY - (enemy.y + enemy.height / 2)) * (1 - Math.pow(0.7, speedFactor));

        if (enemy.width < 1) this.enemies.splice(i, 1);
        continue;
      }

      enemy.x -= enemy.speed * speedFactor;

      if (this.checkCollision(enemy)) {
        this.handleCollision(enemy);
      } else if (enemy.x + enemy.width < 0) {
        this.enemies.splice(i, 1);
      }
    }
  }

  private checkCollision(enemy: Enemy) {
    if (enemy.isEaten) return false;
    return (
      CONFIG.PLAYER.X_POSITION < enemy.x + enemy.width &&
      CONFIG.PLAYER.X_POSITION + this.playerSize > enemy.x &&
      this.playerY < enemy.y + enemy.height &&
      this.playerY + this.playerHeight > enemy.y
    );
  }

  private handleCollision(enemy: Enemy) {
    if (enemy.width < this.playerSize) {
      this.playerSize += enemy.width * CONFIG.PLAYER.GROWTH_RATE * this.scale;
      this.score += enemy.type.basePoints;
      this.audio.playDing();
      if (navigator.vibrate && CONFIG.GAME.HAPTICS.ENABLED) navigator.vibrate(50);
      enemy.isEaten = true;
    } else {
      this.endGame('lost');
    }
  }

  private endGame(state: 'won' | 'lost') {
    this.gameState = state;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('hungry_strawberry_highscore', this.highScore.toString());
    }
    if (state === 'won') {
      this.audio.playWin();
      if (navigator.vibrate && CONFIG.GAME.HAPTICS.ENABLED) navigator.vibrate(500);
    } else {
      this.audio.playLoss();
      if (navigator.vibrate && CONFIG.GAME.HAPTICS.ENABLED) navigator.vibrate(200);
    }
  }

  private spawnEnemy() {
    const progress = (this.timeElapsed / CONFIG.GAME.WIN_TIME_MS) * 100;
    const pool = CONFIG.ENEMIES.filter(t => t.spawnStartPercent <= progress);
    const type = pool[Math.floor(Math.random() * pool.length)];

    const width = (Math.random() * (type.maxSize - type.minSize) + type.minSize) * this.scale;
    const speed = (Math.random() * (type.maxSpeed - type.minSpeed) + type.minSpeed) * this.scale;
    
    this.enemies.push({
      id: this.nextEnemyId++,
      x: this.width,
      y: Math.random() * (this.height - (width / type.aspectRatio)),
      width,
      height: width / type.aspectRatio,
      speed,
      type,
      isAnimated: Math.random() < (type.animationChance ?? 1.0),
      isEaten: false
    });
  }

  private updateButterflies(deltaTime: number, speedFactor: number) {
    this.butterflyTimer += deltaTime;
    if (this.butterflyTimer > 2000) {
      this.spawnButterfly();
      this.butterflyTimer = 0;
    }
    for (let i = this.butterflies.length - 1; i >= 0; i--) {
      const b = this.butterflies[i];
      b.x -= b.speed * speedFactor;
      b.y += Math.sin(this.timeElapsed / 300 + b.phase) * 1.5;
      if (b.x + b.size < -100) this.butterflies.splice(i, 1);
    }
  }

  private spawnButterfly() {
    const size = (12 + Math.random() * 8) * this.scale;
    this.butterflies.push({
      id: this.nextButterflyId++,
      x: this.width + 50,
      y: Math.random() * (this.height - size),
      size,
      speed: (1.5 + Math.random() * 2) * this.scale,
      phase: Math.random() * Math.PI * 2,
      color: ['#ffeb3b', '#f48fb1', '#81d4fa', '#ce93d8'][Math.floor(Math.random() * 4)],
      layer: Math.random() > 0.5 ? 'foreground' : 'background'
    });
  }

  movePlayer(dir: number, speedFactor: number) {
    if (this.gameState !== 'playing') return;
    this.playerY += dir * CONFIG.PLAYER.MOVE_SPEED * this.scale * speedFactor;
    this.clampPlayer();
  }

  movePlayerTo(targetY: number, speedFactor: number) {
    if (this.gameState !== 'playing') return;
    const diff = targetY - (this.playerY + this.playerHeight / 2);
    const step = CONFIG.PLAYER.MOVE_SPEED * this.scale * speedFactor;
    
    if (Math.abs(diff) > step) {
      this.playerY += Math.sign(diff) * step;
    } else {
      this.playerY += diff;
    }
    this.clampPlayer();
  }

  private clampPlayer() {
    if (this.playerY < 0) this.playerY = 0;
    if (this.playerY + this.playerHeight > this.height) this.playerY = this.height - this.playerHeight;
  }

  pause() {
    if (this.gameState === 'playing') this.gameState = 'paused';
  }

  resume() {
    if (this.gameState === 'paused') this.gameState = 'playing';
  }

  quit() {
    this.gameState = 'start';
  }
}