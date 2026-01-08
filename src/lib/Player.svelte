<script lang="ts">
  import { CONFIG } from './config.svelte';

  let { playerY, playerSize, playerHeight } = $props<{
    playerY: number;
    playerSize: number;
    playerHeight: number;
  }>();
</script>

<div 
  class="box player"
  style="
    top: {playerY}px; 
    left: {CONFIG.PLAYER.X_POSITION}px; 
    width: {playerSize}px; 
    height: {playerHeight}px; 
    background-color: {CONFIG.PLAYER.SRC ? 'transparent' : CONFIG.PLAYER.COLOR};
    border: {CONFIG.PLAYER.SRC ? 'none' : '1px solid rgba(0,0,0,0.2)'};
  "
>
  {#if CONFIG.PLAYER.SRC}
    <img src={CONFIG.PLAYER.SRC} alt="player" />
  {/if}
</div>

<style>
  @keyframes sway {
    0%, 100% { transform: translateY(-4px); }
    50% { transform: translateY(4px); }
  }

  .box {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    will-change: top, left;
    transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 5;
  }

  .player {
    animation: sway 3s ease-in-out infinite;
  }

  .box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>