<script lang="ts">
  import { CONFIG } from './config.svelte';

  let { 
    valueY = $bindable(0), 
    active = $bindable(false), 
    touchId = $bindable(null),
    centerX,
    centerY
  } = $props<{
    valueY: number;
    active: boolean;
    touchId: number | null;
    centerX: number;
    centerY: number;
  }>();

  let joystick = $state({ x: 0, y: 0 });

  function handleTouchMove(e: TouchEvent) {
    if (!active) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchId) {
        const container = document.querySelector('.game-container');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        
        const absCenterX = rect.left + centerX;
        const absCenterY = rect.top + centerY;
        
        const dx = touch.clientX - absCenterX;
        const dy = touch.clientY - absCenterY;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), CONFIG.GAME.JOYSTICK.RADIUS);
        const angle = Math.atan2(dy, dx);
        
        joystick.x = Math.cos(angle) * distance;
        joystick.y = Math.sin(angle) * distance;
        valueY = joystick.y / CONFIG.GAME.JOYSTICK.RADIUS;
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        active = false;
        joystick.x = 0;
        joystick.y = 0;
        touchId = null;
        valueY = 0;
      }
    }
  }
</script>

<svelte:window ontouchmove={handleTouchMove} ontouchend={handleTouchEnd} />

<div 
  class="joystick-base" 
  style="width: {CONFIG.GAME.JOYSTICK.BASE_SIZE}px; height: {CONFIG.GAME.JOYSTICK.BASE_SIZE}px; left: {centerX}px; top: {centerY}px;"
>
  <div 
    class="joystick-handle" 
    style="
      width: {CONFIG.GAME.JOYSTICK.HANDLE_SIZE}px; 
      height: {CONFIG.GAME.JOYSTICK.HANDLE_SIZE}px;
      transform: translate({joystick.x}px, {joystick.y}px);
    "
  ></div>
</div>

<style>
  .joystick-base {
    position: absolute;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translate(-50%, -50%);
    z-index: 10;
    touch-action: none;
  }

  .joystick-handle {
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    pointer-events: none;
  }
</style>