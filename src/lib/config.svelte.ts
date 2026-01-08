import playerImg from "../assets/kylie-eating-head-rotated.png";
import strawberryImg from "../assets/strawberry.png";
import blueberryImg from "../assets/blueberry.png";
import catImg from "../assets/eating-cat.png";
import branchImg from "../assets/mouth-branch.png";
import openImg from "../assets/open-mouth.png";

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
  animation?: "tumble" | "wiggle" | "shake" | null;
  animationChance?: number; // 0.0-1.0, percentage of enemies that will have the animation
  aspectRatio: number; // width / height
}

export interface PlayerConfig {
  START_SIZE: number;
  MOVE_SPEED: number;
  GROWTH_RATE: number;
  SRC: string;
  COLOR: string;
  X_POSITION: number;
  ASPECT_RATIO: number;
}

export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { PLAYER: PlayerConfig; ENEMIES: EnemyType[] }
> = {
  easy: {
    PLAYER: {
      START_SIZE: 60,
      MOVE_SPEED: 8,
      GROWTH_RATE: 0.08,
      SRC: playerImg,
      COLOR: "#3498db",
      X_POSITION: 120,
      ASPECT_RATIO: 1.18,
    },
    ENEMIES: [
      {
        id: 1,
        src: strawberryImg,
        color: "#e74c3c",
        minSize: 40,
        maxSize: 60,
        minSpeed: 5,
        maxSpeed: 8,
        basePoints: 10,
        spawnStartPercent: 0,
        animation: "tumble",
        animationChance: 1.0,
        aspectRatio: 1.0,
      },
      {
        id: 2,
        src: blueberryImg,
        color: "#e67e22",
        minSize: 40,
        maxSize: 70,
        minSpeed: 5,
        maxSpeed: 9,
        basePoints: 20,
        spawnStartPercent: 15,
        animation: "tumble",
        animationChance: 1.0,
        aspectRatio: 1.0,
      },
      {
        id: 3,
        src: catImg,
        color: "#f1c40f",
        minSize: 90,
        maxSize: 160,
        minSpeed: 6,
        maxSpeed: 10,
        basePoints: 70,
        spawnStartPercent: 30,
        animation: "wiggle",
        animationChance: 1.0,
        aspectRatio: 1.22,
      },
      {
        id: 4,
        src: branchImg,
        color: "#9b59b6",
        minSize: 80,
        maxSize: 140,
        minSpeed: 12,
        maxSpeed: 15,
        basePoints: 90,
        spawnStartPercent: 50,
        animation: null,
        animationChance: 1.0,
        aspectRatio: 0.97,
      },
      {
        id: 5,
        src: openImg,
        color: "#2ecc71",
        minSize: 150,
        maxSize: 250,
        minSpeed: 2,
        maxSpeed: 7,
        basePoints: 200,
        spawnStartPercent: 65,
        animation: "shake",
        animationChance: 0.4,
        aspectRatio: 0.67,
      },
    ],
  },
  medium: {
    PLAYER: {
      START_SIZE: 60,
      MOVE_SPEED: 8,
      GROWTH_RATE: 0.07,
      SRC: playerImg,
      COLOR: "#3498db",
      X_POSITION: 120,
      ASPECT_RATIO: 1.18,
    },
    ENEMIES: [
      {
        id: 1,
        src: strawberryImg,
        color: "#e74c3c",
        minSize: 40,
        maxSize: 60,
        minSpeed: 5,
        maxSpeed: 8,
        basePoints: 10,
        spawnStartPercent: 0,
        animation: "tumble",
        animationChance: 1.0,
        aspectRatio: 1.0,
      },
      {
        id: 2,
        src: blueberryImg,
        color: "#e67e22",
        minSize: 40,
        maxSize: 70,
        minSpeed: 5,
        maxSpeed: 9,
        basePoints: 20,
        spawnStartPercent: 15,
        animation: "tumble",
        animationChance: 1.0,
        aspectRatio: 1.0,
      },
      {
        id: 3,
        src: catImg,
        color: "#f1c40f",
        minSize: 90,
        maxSize: 185,
        minSpeed: 4,
        maxSpeed: 7,
        basePoints: 70,
        spawnStartPercent: 30,
        animation: "wiggle",
        animationChance: 1.0,
        aspectRatio: 1.22,
      },
      {
        id: 4,
        src: branchImg,
        color: "#9b59b6",
        minSize: 100,
        maxSize: 180,
        minSpeed: 10,
        maxSpeed: 14,
        basePoints: 90,
        spawnStartPercent: 45,
        animation: null,
        animationChance: 1.0,
        aspectRatio: 0.97,
      },
      {
        id: 5,
        src: openImg,
        color: "#2ecc71",
        minSize: 160,
        maxSize: 270,
        minSpeed: 2,
        maxSpeed: 7,
        basePoints: 200,
        spawnStartPercent: 60,
        animation: "shake",
        animationChance: 0.4,
        aspectRatio: 0.67,
      },
    ],
  },
  hard: {
    PLAYER: {
      START_SIZE: 60,
      MOVE_SPEED: 8,
      GROWTH_RATE: 0.06,
      SRC: playerImg,
      COLOR: "#3498db",
      X_POSITION: 120,
      ASPECT_RATIO: 1.18,
    },
    ENEMIES: [
      {
        id: 1,
        src: strawberryImg,
        color: "#e74c3c",
        minSize: 40,
        maxSize: 60,
        minSpeed: 5,
        maxSpeed: 8,
        basePoints: 10,
        spawnStartPercent: 0,
        animation: "tumble",
        animationChance: 1.0,
        aspectRatio: 1.0,
      },
      {
        id: 2,
        src: blueberryImg,
        color: "#e67e22",
        minSize: 40,
        maxSize: 70,
        minSpeed: 5,
        maxSpeed: 9,
        basePoints: 20,
        spawnStartPercent: 15,
        animation: "tumble",
        animationChance: 1.0,
        aspectRatio: 1.0,
      },
      {
        id: 3,
        src: catImg,
        color: "#f1c40f",
        minSize: 100,
        maxSize: 220,
        minSpeed: 5,
        maxSpeed: 7,
        basePoints: 70,
        spawnStartPercent: 30,
        animation: "wiggle",
        animationChance: 1.0,
        aspectRatio: 1.22,
      },
      {
        id: 4,
        src: branchImg,
        color: "#9b59b6",
        minSize: 100,
        maxSize: 200,
        minSpeed: 10,
        maxSpeed: 15,
        basePoints: 90,
        spawnStartPercent: 50,
        animation: null,
        animationChance: 1.0,
        aspectRatio: 0.97,
      },
      {
        id: 5,
        src: openImg,
        color: "#2ecc71",
        minSize: 150,
        maxSize: 350,
        minSpeed: 3,
        maxSpeed: 8,
        basePoints: 200,
        spawnStartPercent: 65,
        animation: "shake",
        animationChance: 0.4,
        aspectRatio: 0.67,
      },
    ],
  },
};

/**
 * Returns a deep copy of the default settings for a given difficulty
 * to prevent accidental mutation of the DIFFICULTY_SETTINGS constant.
 */
const getDifficultyDefaults = (d: Difficulty) => {
  const s = DIFFICULTY_SETTINGS[d];
  return {
    PLAYER: { ...s.PLAYER },
    ENEMIES: s.ENEMIES.map((e) => ({ ...e })),
  };
};

const initialDifficulty: Difficulty = "hard";
const defaults = getDifficultyDefaults(initialDifficulty);

class Config {
  _difficulty = $state<Difficulty>(initialDifficulty);
  
  GAME = $state({
    WIN_TIME_MS: 60000, // 90 seconds to win
    SPAWN_INTERVAL_MS: 1000, // Spawn enemy every 1s
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: "#f0f0f0",
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
  });

  PLAYER = $state<PlayerConfig>(defaults.PLAYER);
  ENEMIES = $state<EnemyType[]>(defaults.ENEMIES);

  get difficulty() {
    return this._difficulty;
  }

  set difficulty(v: Difficulty) {
    this._difficulty = v;
    const newDefaults = getDifficultyDefaults(v);
    this.PLAYER = newDefaults.PLAYER;
    this.ENEMIES = newDefaults.ENEMIES;
  }
}

export const CONFIG = new Config();
