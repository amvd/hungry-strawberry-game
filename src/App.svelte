<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { CONFIG } from './lib/config.svelte';
  import type { Enemy, Butterfly } from './lib/types';
  
  import Player from './lib/Player.svelte';
  import EnemyComponent from './lib/Enemy.svelte';
  import HUD from './lib/HUD.svelte';
  import Overlay from './lib/Overlay.svelte';
  import Joystick from './lib/Joystick.svelte';
  import ButterflyComponent from './lib/Butterfly.svelte';

  // Game State
  let gameState = $state<'start' | 'playing' | 'won' | 'lost'>('start');
  let isPreloading = $state(true);
  let lastTime = 0;
  let timeElapsed = $state(0);
  let spawnTimer = $state(0);
  let score = $state(0);
  let highScore = $state(0);

  let gameWidth = $state(CONFIG.GAME.WIDTH);
  let gameHeight = $state(CONFIG.GAME.HEIGHT);

  // Responsive Scaling
  const scaleMultiplier = $derived(Math.max(0.4, Math.min(1.5, gameWidth / CONFIG.GAME.WIDTH)));
  const scaledMoveSpeed = $derived(CONFIG.PLAYER.MOVE_SPEED * scaleMultiplier);
  const scaledGrowthRate = $derived(CONFIG.PLAYER.GROWTH_RATE * scaleMultiplier);

  // Player State
  let playerY = $state(gameHeight / 2);
  let playerSize = $state(CONFIG.PLAYER.START_SIZE);
  const playerHeight = $derived(playerSize / CONFIG.PLAYER.ASPECT_RATIO);
  
  // Input State
  let keys = $state({ ArrowUp: false, ArrowDown: false });
  let isMouseDown = $state(false);
  let mouseTargetY = $state(0);

  // Mobile/Joystick State
  let joystickActive = $state(false);
  let joystickValueY = $state(0);
  
  let isFullscreen = $state(false);
  // Orientation State
  const isPortrait = $derived(gameHeight > gameWidth);

  // Entities
  let enemies = $state<Enemy[]>([]);
  let nextEnemyId = 0;

  let butterflies = $state<Butterfly[]>([]);
  let nextButterflyId = 0;
  let butterflyTimer = 0;

  // Audio State
  let audioCtx: AudioContext | null = null;
  let nextNoteTime = 0;

  // Game Loop
  let animationFrameId: number;

  onMount(async () => {
    const imagesToPreload = [
      CONFIG.PLAYER.SRC,
      ...CONFIG.ENEMIES.map(e => e.src)
    ].filter(Boolean);

    const savedScore = localStorage.getItem('hungry_strawberry_highscore');
    if (savedScore) highScore = parseInt(savedScore);

    const savedSettings = localStorage.getItem('strawberry_eater_settings');
    if (savedSettings) {
      try {
        const s = JSON.parse(savedSettings);
        CONFIG.GAME.WIN_TIME_MS = s.WIN_TIME_MS ?? CONFIG.GAME.WIN_TIME_MS;
        CONFIG.GAME.SPAWN_INTERVAL_MS = s.SPAWN_INTERVAL_MS ?? CONFIG.GAME.SPAWN_INTERVAL_MS;
        if (s.JOYSTICK) CONFIG.GAME.JOYSTICK = { ...CONFIG.GAME.JOYSTICK, ...s.JOYSTICK };
        if (s.BUTTERFLIES) CONFIG.GAME.BUTTERFLIES.ENABLED = s.BUTTERFLIES.ENABLED;
        if (s.SOUND) CONFIG.GAME.SOUND.ENABLED = s.SOUND.ENABLED;
        CONFIG.PLAYER.GROWTH_RATE = s.GROWTH_RATE ?? CONFIG.PLAYER.GROWTH_RATE;
      } catch (e) { console.error("Failed to load settings:", e); }
    }

    try {
      await Promise.all(imagesToPreload.map(src => {
        const img = new Image();
        img.src = src;
        return img.decode();
      }));
    } catch (e) {
      console.error("Failed to preload images:", e);
    } finally {
      isPreloading = false;
    }

    if (!window.isSecureContext && !navigator.vibrate) {
      console.warn("Haptic feedback is disabled: This browser context is not secure (HTTPS/Localhost required).");
    }

    lastTime = performance.now();
    loop(lastTime);
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        isFullscreen = true;
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen().then(() => {
        isFullscreen = false;
      }).catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
      });
    }
  }

  // Listen for fullscreenchange event to keep state in sync if user exits via ESC key
  document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
  });

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playNote(freq: number) {
    if (!audioCtx || !CONFIG.GAME.SOUND.ENABLED) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  }

  function playDing() {
    if (!audioCtx || !CONFIG.GAME.SOUND.ENABLED) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playWinSound() {
    if (!audioCtx || !CONFIG.GAME.SOUND.ENABLED) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.1);
      osc.stop(audioCtx.currentTime + i * 0.1 + 0.5);
    });
  }

  function playLossSound() {
    if (!audioCtx || !CONFIG.GAME.SOUND.ENABLED) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 1); // A2
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
  }

  function handleMusic(deltaTime: number) {
    nextNoteTime -= deltaTime;
    if (nextNoteTime <= 0) {
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4 Pentatonic
      playNote(scale[Math.floor(Math.random() * scale.length)]);
      nextNoteTime = 800 + Math.random() * 1200;
    }
  }

  function startGame() {
    initAudio();
    gameState = 'playing';
    playerY = (gameHeight - playerHeight) / 2;
    playerSize = CONFIG.PLAYER.START_SIZE * scaleMultiplier;
    enemies = [];
    spawnTimer = 0;
    timeElapsed = 0;
    score = 0;
  }

  function loop(timestamp: number) {
    // Cap deltaTime to 100ms to prevent huge jumps during stutters
    const deltaTime = Math.min(timestamp - lastTime, 100);
    lastTime = timestamp;

    update(deltaTime);
    animationFrameId = requestAnimationFrame(loop);
  }

  function updateHighScore() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('hungry_strawberry_highscore', highScore.toString());
    }
  }

  function update(deltaTime: number) {
    const speedFactor = deltaTime / (1000 / 60); // Normalized to 60 FPS

    // Procedural Music
    if (audioCtx && audioCtx.state === 'running' && CONFIG.GAME.SOUND.ENABLED) {
      handleMusic(deltaTime);
    }

    // Cosmetic Butterflies
    if (CONFIG.GAME.BUTTERFLIES?.ENABLED) {
      updateButterflies(deltaTime, speedFactor);
    }

    if (gameState !== 'playing') {
      timeElapsed += deltaTime;
      return;
    }

    timeElapsed += deltaTime;
    spawnTimer += deltaTime;

    // Win Condition
    if (timeElapsed >= CONFIG.GAME.WIN_TIME_MS) {
      updateHighScore();
      playWinSound();
      if (navigator.vibrate) navigator.vibrate(500);
      gameState = 'won';
      return;
    }

    // Spawning
    if (spawnTimer > CONFIG.GAME.SPAWN_INTERVAL_MS) {
      spawnEnemy();
      spawnTimer = 0;
    }

    // Player Movement
    movePlayer(speedFactor);

    // Enemy Movement & Collision
    updateEnemies(speedFactor);
  }

  function movePlayer(speedFactor: number) {
    let moveDir = 0;
    if (keys.ArrowUp) moveDir = -1;
    if (keys.ArrowDown) moveDir = 1;

    if (joystickActive) {
      playerY += joystickValueY * scaledMoveSpeed * speedFactor;
    } else if (moveDir !== 0) {
      playerY += moveDir * scaledMoveSpeed * speedFactor;
    } else if (isMouseDown) {
      // Move towards mouse
      const diff = mouseTargetY - (playerY + playerHeight / 2);
      const currentMoveSpeed = scaledMoveSpeed * speedFactor;
      if (Math.abs(diff) > currentMoveSpeed) {
        playerY += Math.sign(diff) * currentMoveSpeed;
      } else {
        playerY += diff;
      }
    }

    // Bounds checking
    if (playerY < 0) playerY = 0;
    if (playerY + playerHeight > gameHeight) playerY = gameHeight - playerHeight;
  }

  function spawnEnemy() {
    const progressPercent = (timeElapsed / CONFIG.GAME.WIN_TIME_MS) * 100;
    const availableTypes = CONFIG.ENEMIES.filter(t => t.spawnStartPercent <= progressPercent);
    
    // Pick a random type from those currently unlocked
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    const width = (Math.random() * (type.maxSize - type.minSize) + type.minSize) * scaleMultiplier;
    const height = width / type.aspectRatio;
    const speed = (Math.random() * (type.maxSpeed - type.minSpeed) + type.minSpeed) * scaleMultiplier;
    
    // Random Y position within bounds
    const y = Math.random() * (gameHeight - height);

    enemies.push({
      id: nextEnemyId++,
      x: gameWidth,
      y,
      width,
      height,
      speed,
      type,
      isAnimated: Math.random() < (type.animationChance ?? 1.0),
      isEaten: false
    });
  }

  function spawnButterfly() {
    const size = (12 + Math.random() * 8) * scaleMultiplier;
    const colors = ['#ffeb3b', '#f48fb1', '#81d4fa', '#ce93d8'];
    
    butterflies.push({
      id: nextButterflyId++,
      x: gameWidth + 50,
      y: Math.random() * (gameHeight - size),
      size,
      speed: (1.5 + Math.random() * 2) * scaleMultiplier,
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      layer: Math.random() > 0.5 ? 'foreground' : 'background'
    });
  }

  function updateButterflies(deltaTime: number, speedFactor: number) {
    butterflyTimer += deltaTime;
    if (butterflyTimer > 2000) {
      spawnButterfly();
      butterflyTimer = 0;
    }
    for (let i = butterflies.length - 1; i >= 0; i--) {
      const b = butterflies[i];
      b.x -= b.speed * speedFactor;
      b.y += Math.sin(timeElapsed / 300 + b.phase) * 1.5;
      if (b.x + b.size < -100) butterflies.splice(i, 1);
    }
  }

  function updateEnemies(speedFactor: number) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];

      if (enemy.isEaten) {
        // Calculate player center
        const targetX = CONFIG.PLAYER.X_POSITION + playerSize * 0.75;
        const targetY = playerY + playerHeight * 0.5;

        // Shrink dimensions
        enemy.width *= Math.pow(0.8, speedFactor);
        enemy.height *= Math.pow(0.8, speedFactor);
        // Move top-left coordinates so the enemy center follows the player center
        enemy.x += (targetX - (enemy.x + enemy.width / 2)) * (1 - Math.pow(0.7, speedFactor));
        enemy.y += (targetY - (enemy.y + enemy.height / 2)) * (1 - Math.pow(0.7, speedFactor));

        if (enemy.width < 1) {
          enemies.splice(i, 1);
        }
        continue;
      }

      enemy.x -= enemy.speed * speedFactor;

      // Check Collision
      if (checkCollision(enemy)) {
        handleCollision(enemy, i);
      } 
      // Remove if off screen
      else if (enemy.x + enemy.width < 0) {
        enemies.splice(i, 1);
      }
    }
  }

  function checkCollision(enemy: Enemy) {
    const pLeft = CONFIG.PLAYER.X_POSITION;
    const pRight = CONFIG.PLAYER.X_POSITION + playerSize;
    const pTop = playerY;
    const pBottom = playerY + playerHeight;

    if (enemy.isEaten) return false;

    const eLeft = enemy.x;
    const eRight = enemy.x + enemy.width;
    const eTop = enemy.y;
    const eBottom = enemy.y + enemy.height;

    return (
      pLeft < eRight &&
      pRight > eLeft &&
      pTop < eBottom &&
      pBottom > eTop
    );
  }

  function handleCollision(enemy: Enemy, index: number) {
    if (enemy.width < playerSize) {
      // Eat
      playerSize += enemy.width * scaledGrowthRate;
      score += enemy.type.basePoints;
      playDing();
      if (navigator.vibrate) navigator.vibrate(50);
      enemy.isEaten = true;
    } else {
      // Die
      updateHighScore();
      playLossSound();
      if (navigator.vibrate) navigator.vibrate(200);
      gameState = 'lost';
    }
  }

  // Input Handlers
  function handleKey(e: KeyboardEvent, isDown: boolean) {
    if (e.code === 'ArrowUp') keys.ArrowUp = isDown;
    if (e.code === 'ArrowDown') keys.ArrowDown = isDown;
  }

  function handleMouseDown(e: MouseEvent) {
    isMouseDown = true;
    updateMouseTarget(e);
  }

  function handleMouseMove(e: MouseEvent) {
    if (isMouseDown) {
      updateMouseTarget(e);
    }
  }

  function handleMouseUp() {
    isMouseDown = false;
  }

  function updateMouseTarget(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseTargetY = e.clientY - rect.top;
  }

  onDestroy(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  });
</script>

<svelte:window 
  onkeydown={(e) => handleKey(e, true)} 
  onkeyup={(e) => handleKey(e, false)} 
  onmouseup={handleMouseUp} 
/>

<main>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div 
    class="game-container" 
    style="width: 100%; height: 100%; background-color: {CONFIG.GAME.BACKGROUND_COLOR};"
    bind:clientWidth={gameWidth}
    bind:clientHeight={gameHeight}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    role="application"
    tabindex="0"
  >
    <div class="sky"></div>
    <div class="clouds-back"></div>
    <div class="clouds-front"></div>
    <div class="trees"></div>
    <div class="farmland"></div>

    {#if CONFIG.GAME.BUTTERFLIES?.ENABLED}
      {#each butterflies.filter(b => b.layer === 'background') as butterfly (butterfly.id)}
        <ButterflyComponent {butterfly} />
      {/each}
      {#each butterflies.filter(b => b.layer === 'foreground') as butterfly (butterfly.id)}
        <ButterflyComponent {butterfly} />
      {/each}
    {/if}

    {#if gameState === 'playing'}
      <Player {playerY} {playerSize} {playerHeight} />
      
      {#each enemies as enemy (enemy.id)}
        <EnemyComponent {enemy} />
      {/each}

      <HUD {timeElapsed} {score} />

      <Joystick bind:valueY={joystickValueY} bind:active={joystickActive} />
    {:else}
      <Overlay {gameState} {score} {highScore} {isPreloading} onStart={startGame} />
    {/if}

    <button class="fullscreen-btn" onclick={toggleFullscreen} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
      {#if isFullscreen}
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 12 10 12 10 6"></polyline>
          <polyline points="20 12 14 12 14 6"></polyline>
          <polyline points="14 18 14 12 20 12"></polyline>
          <polyline points="10 18 10 12 4 12"></polyline>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <polyline points="21 15 21 21 15 21"></polyline>
          <polyline points="3 9 3 3 9 3"></polyline>
        </svg>
      {/if}
    </button>

    {#if isPortrait && gameWidth < 1024}
      <div class="orientation-prompt">
        <div class="phone-icon">📱</div>
        <h2>Please rotate your phone</h2>
        <p>This game is best played in landscape mode</p>
      </div>
    {/if}
  </div>
</main>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: sans-serif;
  }
  .game-container {
    position: relative;
    overflow: hidden;
    border: none;
    user-select: none;
    cursor: crosshair;
  }

  .sky {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, #2980b9, #6dd5fa, #ffffff);
    z-index: 1;
  }

  .clouds-back, .clouds-front {
    position: absolute;
    left: 0;
    width: 100%;
    background-size: 400px 200px;
    z-index: 2;
    animation: scroll-bg linear infinite;
  }

  .clouds-back {
    top: 5%;
    height: 200px;
    background-image: 
      radial-gradient(circle at 190px 60px, white 12px, transparent 13px),
      radial-gradient(circle at 210px 55px, white 18px, transparent 19px),
      radial-gradient(circle at 230px 60px, white 12px, transparent 13px);
    opacity: 0.3;
    animation-duration: 90s;
  }

  .clouds-front {
    top: 12%;
    height: 200px;
    background-image: 
      radial-gradient(circle at 50px 50px, white 20px, transparent 21px),
      radial-gradient(circle at 80px 40px, white 25px, transparent 26px),
      radial-gradient(circle at 110px 50px, white 20px, transparent 21px),
      radial-gradient(circle at 260px 120px, white 15px, transparent 16px),
      radial-gradient(circle at 290px 110px, white 22px, transparent 23px),
      radial-gradient(circle at 320px 120px, white 15px, transparent 16px);
    opacity: 0.6;
    animation-duration: 25s;
  }

  .trees {
    position: absolute;
    bottom: 150px;
    left: 0;
    width: 100%;
    height: 100px;
    background-image:
      radial-gradient(ellipse at 0% 110%, #1b5e20 45%, transparent 46%),
      radial-gradient(ellipse at 100% 110%, #1b5e20 45%, transparent 46%),
      radial-gradient(ellipse at 35% 110%, #2e7d32 50%, transparent 51%),
      radial-gradient(ellipse at 70% 110%, #1b5e20 40%, transparent 41%);
    background-size: 400px 100px;
    background-position: 0 0;
    z-index: 3;
    animation: scroll-bg 15s linear infinite;
  }

  .farmland {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background-color: #5d4037;
    background-image: 
      repeating-linear-gradient(
        90deg,
        #8bc34a 0px,
        #8bc34a 40px,
        #689f38 40px,
        #689f38 50px,
        transparent 50px,
        transparent 200px
      );
    background-size: 200px 150px;
    z-index: 4;
    animation: scroll-bg 4s linear infinite;
  }

  @keyframes scroll-bg {
    from { background-position-x: 0; }
    to { background-position-x: -400px; }
  }

  .orientation-prompt {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #2c3e50;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 100;
    text-align: center;
    padding: 20px;
  }

  .phone-icon {
    font-size: 5rem;
    margin-bottom: 20px;
    animation: rotate-phone 2s ease-in-out infinite;
  }

  @keyframes rotate-phone {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(90deg); }
  }

  .fullscreen-btn {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.2s, transform 0.2s;
    z-index: 20; /* Ensure it's above other game elements */
    color: white; /* Make icon visible */
  }
  .fullscreen-btn:hover { background: rgba(255, 255, 255, 0.4); }
</style>