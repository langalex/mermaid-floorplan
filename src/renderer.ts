import type { Floorplan } from "floorplans-language";
import type { LangiumDocument } from "langium";
import { generateRoomRectangle } from "./room/index.js";
import { generateFloorRectangle, calculateFloorBounds } from "./floor/index.js";

export default async function render(
  document: LangiumDocument<Floorplan>
): Promise<string> {
  const floorplan = document.parseResult.value;
  const floor = floorplan.floors[0];
  if (!floor) {
    return "";
  }

  // Calculate bounding box for all rooms
  const bounds = calculateFloorBounds(floor);

  let svg = `<svg viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">`;

  // Iterate through all floors and their rooms
  if (floor.rooms.length > 0) {
    // Generate floor boundary rectangle
    svg += generateFloorRectangle(floor);

    // Generate room rectangles
    for (const room of floor.rooms) {
      svg += generateRoomRectangle(room);
    }
  }

  svg += "</svg>";
  return svg;
}
