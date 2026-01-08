<script lang="ts">
  import { CONFIG } from './config.svelte';
  import DifficultySelector from './DifficultySelector.svelte';
  
  let { onClose } = $props<{ onClose: () => void }>();

  // Local state for win time to handle ms/sec conversion smoothly
  let winTimeSec = $state(CONFIG.GAME.WIN_TIME_MS / 1000);
  let growthRateDisplay = $state(CONFIG.PLAYER.GROWTH_RATE * 100);

  // Update display values when difficulty is changed via the selector
  $effect(() => {
    growthRateDisplay = Math.round(CONFIG.PLAYER.GROWTH_RATE * 100);
  });
  
  $effect(() => {
    CONFIG.GAME.WIN_TIME_MS = winTimeSec * 1000;
  });
  
  $effect(() => {
    CONFIG.PLAYER.GROWTH_RATE = growthRateDisplay / 100;
  });

  function handleClose() {
    localStorage.setItem('strawberry_eater_settings', JSON.stringify({
      difficulty: CONFIG.difficulty,
      WIN_TIME_MS: CONFIG.GAME.WIN_TIME_MS,
      SPAWN_INTERVAL_MS: CONFIG.GAME.SPAWN_INTERVAL_MS,
      JOYSTICK: $state.snapshot(CONFIG.GAME.JOYSTICK),
      BUTTERFLIES: $state.snapshot(CONFIG.GAME.BUTTERFLIES),
      SOUND: $state.snapshot(CONFIG.GAME.SOUND),
      HAPTICS: $state.snapshot(CONFIG.GAME.HAPTICS),
      GROWTH_RATE: CONFIG.PLAYER.GROWTH_RATE
    }));
    onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="settings-backdrop" onclick={handleClose}>
  <div class="settings-content" onclick={(e) => e.stopPropagation()}>
    <h2>Game Settings</h2>
    
    <DifficultySelector />

    <div class="setting-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={CONFIG.GAME.BUTTERFLIES.ENABLED} />
        Butterflies Enabled
      </label>
    </div>

    <div class="setting-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={CONFIG.GAME.SOUND.ENABLED} />
        Sound Enabled
      </label>
    </div>

    <div class="setting-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={CONFIG.GAME.HAPTICS.ENABLED} />
        Haptics Enabled
      </label>
    </div>

    <h3 class="advanced-header">Advanced</h3>

    <div class="setting-group">
      <label for="winTime">Win Time (seconds)</label>
      <input id="winTime" type="number" bind:value={winTimeSec} min="1" />
    </div>

    <div class="setting-group">
      <label for="spawnInterval">Spawn Interval (ms)</label>
      <input id="spawnInterval" type="number" bind:value={CONFIG.GAME.SPAWN_INTERVAL_MS} min="100" step="100" />
    </div>

    <div class="setting-group">
      <label for="growthRate">Growth Rate</label>
      <input id="growthRate" type="number" bind:value={growthRateDisplay} min="1" step="1" />
    </div>

    <div class="setting-group">
      <h3>Joystick Settings</h3>
      <label for="joyRadius">Radius</label>
      <input id="joyRadius" type="number" bind:value={CONFIG.GAME.JOYSTICK.RADIUS} min="20" />
      <label for="joyBase">Base Size</label>
      <input id="joyBase" type="number" bind:value={CONFIG.GAME.JOYSTICK.BASE_SIZE} min="40" />
      <label for="joyHandle">Handle Size</label>
      <input id="joyHandle" type="number" bind:value={CONFIG.GAME.JOYSTICK.HANDLE_SIZE} min="20" />
    </div>

    <button class="close-btn" onclick={handleClose}>Close & Save</button>
  </div>
</div>

<style>
  .settings-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    color: white;
    text-align: left;
    font-family: sans-serif;
  }
  .settings-content {
    background: #2c3e50;
    padding: 2rem;
    border-radius: 1rem;
    width: 90%;
    max-width: 400px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  h2 { margin-top: 0; color: #ecf0f1; }
  .advanced-header { margin: 2rem 0 1rem 0; font-size: 1.2rem; color: #e74c3c; border-bottom: 2px solid #c0392b; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
  h3 { margin: 1rem 0 0.5rem 0; font-size: 1rem; color: #bdc3c7; }
  .setting-group { margin-bottom: 1.2rem; }
  label { display: block; margin-bottom: 0.3rem; font-size: 0.9rem; color: #bdc3c7; }
  .checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; color: white; font-size: 1.1rem; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; }
  input[type="number"] {
    width: 100%;
    padding: 0.6rem;
    border-radius: 0.4rem;
    border: 1px solid #34495e;
    background: #1a252f;
    color: white;
    font-size: 1rem;
  }
  input[type="checkbox"] { width: 20px; height: 20px; }
  .close-btn {
    width: 100%;
    padding: 0.8rem;
    background: #27ae60;
    border: none;
    color: white;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 1rem;
    transition: background 0.2s;
  }
  .close-btn:hover { background: #2ecc71; }
</style>