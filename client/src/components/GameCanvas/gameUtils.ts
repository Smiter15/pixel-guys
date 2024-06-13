import { PLAYER_SIZE } from './gameConstants';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  return function (...args: any[]) {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export const checkHorizontalCollision = (
  x: number,
  y: number,
  obstacles: Obstacle[]
): { collides: boolean; newX: number } => {
  for (const obstacle of obstacles) {
    if (
      x < obstacle.x + obstacle.width &&
      x + PLAYER_SIZE > obstacle.x &&
      y < obstacle.y + obstacle.height &&
      y + PLAYER_SIZE > obstacle.y
    ) {
      let newX = x;
      if (x + PLAYER_SIZE > obstacle.x && x < obstacle.x)
        newX = obstacle.x - PLAYER_SIZE;
      if (
        x < obstacle.x + obstacle.width &&
        x + PLAYER_SIZE > obstacle.x + obstacle.width
      )
        newX = obstacle.x + obstacle.width;
      return { collides: true, newX };
    }
  }
  return { collides: false, newX: x };
};

export const checkVerticalCollision = (
  x: number,
  y: number,
  obstacles: Obstacle[]
): { collides: boolean; newY: number } => {
  for (const obstacle of obstacles) {
    if (
      x < obstacle.x + obstacle.width &&
      x + PLAYER_SIZE > obstacle.x &&
      y < obstacle.y + obstacle.height &&
      y + PLAYER_SIZE > obstacle.y
    ) {
      let newY = y;
      if (y + PLAYER_SIZE > obstacle.y && y < obstacle.y)
        newY = obstacle.y - PLAYER_SIZE;
      if (
        y < obstacle.y + obstacle.height &&
        y + PLAYER_SIZE > obstacle.y + obstacle.height
      )
        newY = obstacle.y + obstacle.height;
      return { collides: true, newY };
    }
  }
  return { collides: false, newY: y };
};

export const normalizeMovement = (
  dx: number,
  dy: number,
  step: number
): { dx: number; dy: number } => {
  if (dx !== 0 && dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx = (dx / length) * step;
    dy = (dy / length) * step;
  }
  return { dx, dy };
};
