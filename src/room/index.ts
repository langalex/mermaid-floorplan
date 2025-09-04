import type { Room } from "floorplans-language";

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

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
    fill="lightblue" stroke="black" stroke-width="0.1" />
    ${generateRoomText(room, centerX, centerY)}`;
}
