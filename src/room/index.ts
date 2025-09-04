import type { Room } from "floorplans-language";

export function generateRoomText(
  room: Room,
  centerX: number,
  centerY: number
): string {
  return `<text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" 
    font-size="1" fill="black">${room.name}</text>`;
}

export function generateRoomRectangle(room: Room): string {
  const x = room.position.x;
  const y = room.position.y;
  const width = room.size.width;
  const height = room.size.height;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
    fill="lightblue" stroke="black" stroke-width="0.1" />
    ${generateRoomText(room, centerX, centerY)}`;
}
