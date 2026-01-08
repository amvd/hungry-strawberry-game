<script lang="ts">
  import { CONFIG } from './config.svelte';

  let { timeElapsed, score } = $props<{ timeElapsed: number; score: number }>();
</script>

<div class="hud">
  <div>Time: {Math.floor(timeElapsed / 1000)} / {CONFIG.GAME.WIN_TIME_MS / 1000}s</div>
  <div>Score: {score}</div>
</div>

<style>
  .hud {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    text-align: right;
    z-index: 6;
  }
</style>