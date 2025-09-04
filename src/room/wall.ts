import { generateDoor } from "./door.js";

export function wallRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  wallType: string,
  wallDirection?: string
): string {
  if (wallType === "open") {
    return "";
  }

  if (wallType === "door") {
    const wall = `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
      fill="black" stroke="black" stroke-width="0.05" />`;
    const door = generateDoor(x, y, width, height, wallDirection);
    return wall + door;
  }

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
    fill="black" stroke="black" stroke-width="0.05" />`;
}
