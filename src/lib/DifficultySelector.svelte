<script lang="ts">
  import { CONFIG } from "./config.svelte";
</script>

<div class="difficulty-container">
  <div class="difficulty-selector">
    <button
      class="diff-btn easy"
      class:active={CONFIG.difficulty === "easy"}
      onclick={() => (CONFIG.difficulty = "easy")}
    >
      Easy
    </button>
    <button
      class="diff-btn medium"
      class:active={CONFIG.difficulty === "medium"}
      onclick={() => (CONFIG.difficulty = "medium")}
    >
      Medium
    </button>
    <button
      class="diff-btn hard"
      class:active={CONFIG.difficulty === "hard"}
      onclick={() => (CONFIG.difficulty = "hard")}
    >
      Hard
    </button>
  </div>
</div>

<style>
  .difficulty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin: 20px;
  }

  .difficulty-selector {
    display: flex;
    gap: 10px;
  }

  .diff-btn {
    padding: 6px 12px;
    border: 3px solid transparent;
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .diff-btn.easy { background-color: #2ecc71; }
  .diff-btn.medium { background-color: #f1c40f; color: #333; text-shadow: none; }
  .diff-btn.hard { background-color: #8b0000; }

  .diff-btn:hover {
    transform: scale(1.05);
  }
  .diff-btn.active {
    border-color: white;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
</style>