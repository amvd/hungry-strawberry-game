import playerImg from '../assets/kylie-eating-head-rotated.png';
import strawberryImg from '../assets/strawberry.png';
import blueberryImg from '../assets/blueberry.png';
import catImg from '../assets/eating-cat.png';
import branchImg from '../assets/mouth-branch.png';
import openImg from '../assets/open-mouth.png';

export interface EnemyType {
  id: number;
  src: string; // URL for the image
  color: string; // Fallback color
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
  basePoints: number;
  spawnStartPercent: number; // Percentage of WIN_TIME_MS when this enemy starts appearing
  animation?: 'tumble' | 'wiggle' | 'shake';
  animationChance?: number; // 0.0-1.0, percentage of enemies that will have the animation
  aspectRatio: number; // width / height
}

export const CONFIG = $state({
  PLAYER: {
    START_SIZE: 60,
    MOVE_SPEED: 8, // Pixels per frame
    GROWTH_RATE: 0.05, // Multiplier of enemy width added to player size when eating
    SRC: playerImg, // URL for the player image
    COLOR: '#3498db', // Blue
    X_POSITION: 120, // Fixed X position from left
    ASPECT_RATIO: 1.18,
  },
  GAME: {
    WIN_TIME_MS: 90000, // 90 seconds to win
    SPAWN_INTERVAL_MS: 1000, // Spawn enemy every 1s
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#f0f0f0',
    JOYSTICK: {
      RADIUS: 60,
      BASE_SIZE: 120,
      HANDLE_SIZE: 60,
    },
    BUTTERFLIES: {
      ENABLED: true,
    },
    SOUND: {
      ENABLED: true,
    },
    HAPTICS: {
      ENABLED: true,
    },
  },
  ENEMIES: [
    {
      id: 1,
      src: strawberryImg,
      color: '#e74c3c', // Red
      minSize: 40,
      maxSize: 60,
      minSpeed: 5,
      maxSpeed: 8,
      basePoints: 10,
      spawnStartPercent: 0,
      animation: 'tumble',
      animationChance: 1.0,
      aspectRatio: 1.0,
    },
    {
      id: 2,
      src: blueberryImg,
      color: '#e67e22', // Orange
      minSize: 40,
      maxSize: 70,
      minSpeed: 5,
      maxSpeed: 9,
      basePoints: 20,
      spawnStartPercent: 15,
      animation: 'tumble',
      animationChance: 1.0,
      aspectRatio: 1.0,
    },
    {
      id: 3,
      src: catImg,
      color: '#f1c40f', // Yellow
      minSize: 100,
      maxSize: 170,
      minSpeed: 6,
      maxSpeed: 12,
      basePoints: 70,
      spawnStartPercent: 35,
      animation: 'wiggle',
      animationChance: 1.0,
      aspectRatio: 1.22,
    },
    {
      id: 4,
      src: branchImg,
      color: '#9b59b6', // Purple
      minSize: 80,
      maxSize: 160,
      minSpeed: 12,
      maxSpeed: 15,
      basePoints: 90,
      spawnStartPercent: 55,
      animation: null,
      animationChance: 1.0,
      aspectRatio: 0.97,
    },
    {
      id: 5,
      src: openImg,
      color: '#2ecc71', // Green
      minSize: 150,
      maxSize: 350,
      minSpeed: 3,
      maxSpeed: 8,
      basePoints: 200,
      spawnStartPercent: 70,
      animation: 'shake',
      animationChance: 0.4,
      aspectRatio: 0.67,
    },
  ] as EnemyType[],
});