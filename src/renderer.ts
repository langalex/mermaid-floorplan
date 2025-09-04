import type { Floorplan, Floor, Room } from "floorplans-language";
import type { LangiumDocument } from "langium";

export default async function render(
  document: LangiumDocument<Floorplan>
): Promise<string> {
  const floorplan = document.parseResult.value;

  // Calculate bounding box for all rooms
  const bounds = calculateBounds(floorplan);

  let svg = `<svg viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">`;

  // Iterate through all floors and their rooms
  for (const floor of floorplan.floors) {
    if (floor.rooms.length > 0) {
      // Generate floor boundary rectangle
      svg += generateFloorRectangle(floor);

      // Generate room rectangles
      for (const room of floor.rooms) {
        svg += generateRoomRectangle(room);
      }
    }
  }

  svg += "</svg>";
  return svg;
}

function calculateBounds(floorplan: Floorplan): {
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

  for (const floor of floorplan.floors) {
    const floorBounds = calculateFloorBounds(floor);
    minX = Math.min(minX, floorBounds.minX);
    minY = Math.min(minY, floorBounds.minY);
    maxX = Math.max(maxX, floorBounds.maxX);
    maxY = Math.max(maxY, floorBounds.maxY);
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

function generateFloorRectangle(floor: Floor): string {
  const floorBounds = calculateFloorBounds(floor);

  return `<rect x="${floorBounds.minX}" y="${floorBounds.minY}" 
    width="${floorBounds.width}" height="${floorBounds.height}" 
    fill="none" stroke="black" stroke-width="0.1" />`;
}

function calculateFloorBounds(floor: Floor): {
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

function generateRoomRectangle(room: Room): string {
  const x = room.position.x;
  const y = room.position.y;
  const width = room.size.width;
  const height = room.size.height;

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
    fill="lightblue" stroke="black" stroke-width="0.1" />`;
}
