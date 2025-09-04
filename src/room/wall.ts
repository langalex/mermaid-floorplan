import { generateDoor } from "./door.js";
import { generateWindow } from "./window.js";

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

  const wall = `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
      fill="black" stroke="black" stroke-width="0.05" />`;

  if (wallType === "door") {
    const door = generateDoor(x, y, width, height, wallDirection);
    return wall + door;
  }

  if (wallType === "window") {
    const window = generateWindow(x, y, width, height, wallDirection);
    return wall + window;
  }

  return wall;
}
