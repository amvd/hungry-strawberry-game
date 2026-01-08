<script lang="ts">
  import type { Enemy as EnemyType } from './types';

  let { enemy } = $props<{ enemy: EnemyType }>();
</script>

<div 
  class="box enemy {enemy.isAnimated && enemy.type.animation ? 'anim-' + enemy.type.animation : ''}"
  style="
    top: {enemy.y}px; 
    left: {enemy.x}px; 
    width: {enemy.width}px; 
    height: {enemy.height}px; 
    background-color: {enemy.type.src ? 'transparent' : enemy.type.color};
    border: {enemy.type.src ? 'none' : '1px solid rgba(0,0,0,0.2)'};
  "
>
  {#if enemy.type.src}
    <img src={enemy.type.src} alt="enemy" />
  {/if}
</div>

<style>
  .box {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    will-change: top, left;
    z-index: 5;
  }

  .box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @keyframes tumble {
    0% { transform: rotate(0deg) translateY(0); }
    25% { transform: rotate(-90deg) translateY(-6px); }
    50% { transform: rotate(-180deg) translateY(0); }
    75% { transform: rotate(-270deg) translateY(6px); }
    100% { transform: rotate(-360deg) translateY(0); }
  }

  @keyframes wiggle {
    0% { transform: translate(0, -10px); }
    25% { transform: translate(10px, 0); }
    50% { transform: translate(0, 10px); }
    75% { transform: translate(-10px, 0); }
    100% { transform: translate(0, -10px); }
  }

  @keyframes shake {
    0%, 100% { transform: translate(-5px, 5px); }
    50% { transform: translate(5px, -5px); }
  }

  .anim-tumble {
    animation: tumble 2s linear infinite;
  }

  .anim-wiggle {
    animation: wiggle 0.6s linear infinite;
  }

  .anim-shake {
    animation: shake 0.1s linear infinite;
  }
</style>