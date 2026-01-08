import type { EnemyType } from './config.svelte';

export type GameState = 'start' | 'playing' | 'won' | 'lost';

export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: EnemyType;
  isAnimated: boolean;
  isEaten: boolean;
}

export interface Butterfly {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  color: string;
  layer: 'background' | 'foreground';
}