<script lang="ts">
  import type { Butterfly as ButterflyType } from './types';
  let { butterfly } = $props<{ butterfly: ButterflyType }>();
</script>

<div
  class="butterfly"
  style="
    left: {butterfly.x}px;
    top: {butterfly.y}px;
    width: {butterfly.size}px;
    height: {butterfly.size}px;
    --butterfly-color: {butterfly.color};
    z-index: {butterfly.layer === 'foreground' ? 11 : 2};
  "
>
  <div class="wing left"></div>
  <div class="wing right"></div>
</div>

<style>
  .butterfly {
    position: absolute;
    pointer-events: none;
    will-change: left, top;
  }
  .wing {
    position: absolute;
    width: 50%;
    height: 100%;
    background-color: var(--butterfly-color);
    opacity: 0.8;
  }
  .left {
    left: 0;
    border-radius: 50% 50% 0 50%;
    transform-origin: right;
    animation: flap-left 0.2s ease-in-out infinite alternate;
  }
  .right {
    right: 0;
    border-radius: 50% 50% 50% 0;
    transform-origin: left;
    animation: flap-right 0.2s ease-in-out infinite alternate;
  }
  @keyframes flap-left { from { transform: rotateY(0deg); } to { transform: rotateY(70deg); } }
  @keyframes flap-right { from { transform: rotateY(0deg); } to { transform: rotateY(-70deg); } }
</style>