import type { Floor } from "floorplans-language";

export function generateFloorRectangle(floor: Floor): string {
  const floorBounds = calculateFloorBounds(floor);

  return `<rect x="${floorBounds.minX}" y="${floorBounds.minY}" 
    width="${floorBounds.width}" height="${floorBounds.height}" 
    fill="none" stroke="black" stroke-width="0.1" />`;
}

export function calculateFloorBounds(floor: Floor): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const room of floor.rooms) {
    const x = room.position.x;
    const y = room.position.y;
    const width = room.size.width;
    const height = room.size.height;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
