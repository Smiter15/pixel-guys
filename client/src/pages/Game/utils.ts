export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 400;
export const PLAYER_SIZE = 10;
export const STEP = 3;

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

export const calculatePlayerRankings = (
  players: { id: string; name: string; x: number; y: number }[]
) => {
  return players.slice().sort((a, b) => a.y - b.y);
};

export const getOrdinalSuffix = (i: number) => {
  const j = i % 10;
  const k = i % 100;

  if (j === 1 && k !== 11) return `${i}st`;
  if (j === 2 && k !== 12) return `${i}nd`;
  if (j === 3 && k !== 13) return `${i}rd`;

  return `${i}th`;
};
