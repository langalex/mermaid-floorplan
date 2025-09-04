import type { Room } from "floorplans-language";

export function generateRoomRectangle(room: Room): string {
  const x = room.position.x;
  const y = room.position.y;
  const width = room.size.width;
  const height = room.size.height;

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
    fill="lightblue" stroke="black" stroke-width="0.1" />`;
}
