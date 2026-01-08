<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { CONFIG } from './lib/config.svelte';
  import { GameEngine } from './lib/game.svelte';
  
  import Player from './lib/Player.svelte';
  import EnemyComponent from './lib/Enemy.svelte';
  import HUD from './lib/HUD.svelte';
  import Overlay from './lib/Overlay.svelte';
  import Joystick from './lib/Joystick.svelte';
  import ButterflyComponent from './lib/Butterfly.svelte';

  const game = new GameEngine();

  let isPreloading = $state(true);
  let lastTime = 0;
  
  let keys = $state({ ArrowUp: false, ArrowDown: false });
  let isMouseDown = $state(false);
  let mouseTargetY = $state(0);
  let isFullscreen = $state(false);
  let joystickActive = $state(false);
  let joystickValueY = $state(0);

  let animationFrameId: number;

  onMount(async () => {
    const imagesToPreload = [
      CONFIG.PLAYER.SRC,
      ...CONFIG.ENEMIES.map(e => e.src)
    ].filter(Boolean);

    const savedSettings = localStorage.getItem('strawberry_eater_settings');
    if (savedSettings) {
      try {
        const s = JSON.parse(savedSettings);
        CONFIG.GAME.WIN_TIME_MS = s.WIN_TIME_MS ?? CONFIG.GAME.WIN_TIME_MS;
        CONFIG.GAME.SPAWN_INTERVAL_MS = s.SPAWN_INTERVAL_MS ?? CONFIG.GAME.SPAWN_INTERVAL_MS;
        if (s.JOYSTICK) CONFIG.GAME.JOYSTICK = { ...CONFIG.GAME.JOYSTICK, ...s.JOYSTICK };
        if (s.BUTTERFLIES) CONFIG.GAME.BUTTERFLIES.ENABLED = s.BUTTERFLIES.ENABLED;
        if (s.SOUND) CONFIG.GAME.SOUND.ENABLED = s.SOUND.ENABLED;
        if (s.HAPTICS) CONFIG.GAME.HAPTICS.ENABLED = s.HAPTICS.ENABLED;
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

  function loop(timestamp: number) {
    // Cap deltaTime to 100ms to prevent huge jumps during stutters
    const deltaTime = Math.min(timestamp - lastTime, 100);
    lastTime = timestamp;

    const speedFactor = deltaTime / (1000 / 60);
    if (game.gameState === 'playing') {
      if (joystickActive) {
        // Move player based on joystick displacement
        game.movePlayer(joystickValueY, speedFactor);
      } else {
        let dir = 0;
        if (keys.ArrowUp) dir = -1;
        if (keys.ArrowDown) dir = 1;
        if (dir !== 0) game.movePlayer(dir, speedFactor);
        else if (isMouseDown) game.movePlayerTo(mouseTargetY, speedFactor);
      }
    }

    game.update(deltaTime);
    animationFrameId = requestAnimationFrame(loop);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => isFullscreen = true);
    } else {
      document.exitFullscreen().then(() => isFullscreen = false);
    }
  }

  document.addEventListener('fullscreenchange', () => isFullscreen = !!document.fullscreenElement);

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
    bind:clientWidth={game.width}
    bind:clientHeight={game.height}
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
      {#each game.butterflies.filter(b => b.layer === 'background') as butterfly (butterfly.id)}
        <ButterflyComponent {butterfly} />
      {/each}
      {#each game.butterflies.filter(b => b.layer === 'foreground') as butterfly (butterfly.id)}
        <ButterflyComponent {butterfly} />
      {/each}
    {/if}

    {#if game.gameState === 'playing'}
      <Player playerY={game.playerY} playerSize={game.playerSize} playerHeight={game.playerHeight} />
      
      {#each game.enemies as enemy (enemy.id)}
        <EnemyComponent {enemy} />
      {/each}

      <HUD timeElapsed={game.timeElapsed} score={game.score} />

      <Joystick bind:valueY={joystickValueY} bind:active={joystickActive} />
    {:else}
      <Overlay gameState={game.gameState} score={game.score} highScore={game.highScore} {isPreloading} onStart={() => game.start()} />
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

    {#if game.height > game.width && game.width < 1024}
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