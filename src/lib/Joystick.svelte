<script lang="ts">
  import { CONFIG } from './config.svelte';

  let { valueY = $bindable(0), active = $bindable(false) } = $props();

  let joystick = $state({ x: 0, y: 0, touchId: null as number | null });

  function handleJoystickStart(e: TouchEvent) {
    const touch = e.changedTouches[0];
    active = true;
    joystick.touchId = touch.identifier;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!active) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystick.touchId) {
        const base = document.querySelector('.joystick-base')?.getBoundingClientRect();
        if (!base) return;
        
        const centerX = base.left + base.width / 2;
        const centerY = base.top + base.height / 2;
        
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), CONFIG.GAME.JOYSTICK.RADIUS);
        const angle = Math.atan2(dy, dx);
        
        joystick.x = Math.cos(angle) * distance;
        joystick.y = Math.sin(angle) * distance;
        valueY = joystick.y / CONFIG.GAME.JOYSTICK.RADIUS;
      }
    }
  }

  function handleTouchEnd() {
    active = false;
    joystick.x = 0;
    joystick.y = 0;
    joystick.touchId = null;
    valueY = 0;
  }
</script>

<svelte:window ontouchmove={handleTouchMove} ontouchend={handleTouchEnd} />

<div 
  class="joystick-base" 
  style="width: {CONFIG.GAME.JOYSTICK.BASE_SIZE}px; height: {CONFIG.GAME.JOYSTICK.BASE_SIZE}px;"
  ontouchstart={handleJoystickStart}
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
    bottom: 40px;
    left: 40px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
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