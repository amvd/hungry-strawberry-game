<script lang="ts">
  import Settings from './Settings.svelte';

  let { gameState, score, highScore, isPreloading, onStart } = $props<{
    gameState: 'start' | 'playing' | 'won' | 'lost';
    score: number;
    highScore: number;
    isPreloading: boolean;
    onStart: () => void;
  }>();

  let showSettings = $state(false);
  let showInstructions = $state(false);
</script>

<div class="overlay {gameState === 'start' ? 'theme-strawberry' : 'theme-blueberry'}">
  {#if gameState === 'start'}
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
          <path d="M0.5,1 C0.5,1 0,0.7 0,0.35 C0,0.15 0.2,0 0.5,0.2 C0.8,0 1,0.15 1,0.35 C1,0.7 0.5,1 0.5,1" />
        </clipPath>
      </defs>
    </svg>
    <div class="heart-shape"></div>
  {/if}

  {#if gameState === 'start'}
    <h1>Hungry Strawberry</h1>
    {#if isPreloading}
      <button disabled>Loading Assets...</button>
    {:else}
      <button onclick={onStart}>Play</button>
      <button class="secondary-btn" onclick={() => showInstructions = true}>How to Play</button>
    {/if}
  {:else if gameState === 'won'}
    <h1>You Won!</h1>
    <p class="final-score">{score}</p>
    <p class="high-score">Best: {highScore}</p>
    <button onclick={onStart}>Play Again</button>
  {:else if gameState === 'lost'}
    <h1>You got eated :(</h1>
    <p class="final-score">{score}</p>
    <p class="high-score">Best: {highScore}</p>
    <button onclick={onStart}>Try Again</button>
  {/if}

  <button class="settings-btn" onclick={() => showSettings = true} aria-label="Settings">
    ⚙️
  </button>

  {#if showSettings}
    <Settings onClose={() => showSettings = false} />
  {/if}

  {#if showInstructions}
    <div class="modal-backdrop" onclick={() => showInstructions = false}>
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <p>Eat things that are smaller than you. Get eaten by things that are bigger than you. That is all. :)</p>
        <button onclick={() => showInstructions = false}>Got it!</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    text-align: center;
  }

  .theme-strawberry {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .heart-shape {
    position: absolute;
    width: 90vw;
    height: 90vw;
    max-width: 550px;
    max-height: 550px;
    background-color: #e74c3c;
    background-image: radial-gradient(#f1c40f 12%, transparent 12%);
    background-size: 40px 60px;
    background-position: 0 0, 20px 30px;
    clip-path: url(#heart-clip);
    z-index: -1;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
  }

  .theme-strawberry h1 {
    text-shadow: 4px 4px #27ae60;
  }

  .theme-strawberry button {
    background-color: #27ae60;
    border: 3px solid #2ecc71;
    color: white;
    border-radius: 20px;
    font-weight: bold;
  }

  .theme-blueberry {
    background-color: #1a5276;
    background-image: radial-gradient(#154360 40%, transparent 40%);
    background-size: 100px 100px;
  }

  .theme-blueberry h1 {
    text-shadow: 4px 4px #7d3c98;
  }

  .theme-blueberry button {
    background-color: #7d3c98;
    border: 3px solid #8e44ad;
    color: white;
    border-radius: 20px;
    font-weight: bold;
  }

  h1 {
    margin: 0;
    font-size: 3rem;
    position: relative;
  }

  .final-score {
    font-size: 5rem;
    font-weight: 900;
    margin: 10px 0;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }

  .high-score {
    font-size: 1.2rem;
    opacity: 0.8;
    margin-bottom: 20px;
  }

  button {
    padding: 10px 20px;
    font-size: 1.5rem;
    cursor: pointer;
    margin-top: 20px;
  }

  .secondary-btn {
    background-color: rgba(255, 255, 255, 0.1);
    border: 2px solid white;
    color: white;
    border-radius: 20px;
  }

  .settings-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.2s, transform 0.2s;
    z-index: 20;
  }
  .settings-btn:hover { background: rgba(255, 255, 255, 0.4); transform: rotate(30deg); }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal-content {
    background: #2c3e50;
    padding: 2rem;
    border-radius: 1rem;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }

  .modal-content p {
    font-size: 1.2rem;
    line-height: 1.5;
  }
</style>