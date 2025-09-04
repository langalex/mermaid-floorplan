import type { Room } from "floorplans-language";
import { wallRectangle } from "./wall.js";

export function generateRoomText(
  room: Room,
  centerX: number,
  centerY: number
): string {
  const displayText = room.label ? `${room.name} (${room.label})` : room.name;
  return `<text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" 
    font-size="0.8" fill="black">${displayText}</text>`;
}

export function generateRoomRectangle(room: Room): string {
  const x = room.position.x;
  const y = room.position.y;
  const width = room.size.width;
  const height = room.size.height;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const wallThickness = 0.2;

  // Helper function to get wall type for a direction
  const getWallType = (direction: string): string => {
    const wallSpec = room.walls.specifications.find(
      (spec) => spec.direction === direction
    );
    return wallSpec?.type || "solid";
  };

  // Top wall
  const topWall = wallRectangle(
    x,
    y,
    width,
    wallThickness,
    getWallType("top"),
    "top"
  );

  // Right wall
  const rightWall = wallRectangle(
    x + width - wallThickness,
    y,
    wallThickness,
    height,
    getWallType("right"),
    "right"
  );

  // Bottom wall
  const bottomWall = wallRectangle(
    x,
    y + height - wallThickness,
    width,
    wallThickness,
    getWallType("bottom"),
    "bottom"
  );

  // Left wall
  const leftWall = wallRectangle(
    x,
    y,
    wallThickness,
    height,
    getWallType("left"),
    "left"
  );

  return `${topWall}${rightWall}${bottomWall}${leftWall}${generateRoomText(
    room,
    centerX,
    centerY
  )}`;
}
