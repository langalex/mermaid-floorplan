import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import type { Floorplan } from "floorplans-language";
import { createFloorplansServices } from "floorplans-language";
import render from "./renderer.js";

export default async function main(): Promise<void> {
  const services = createFloorplansServices(EmptyFileSystem);
  const parse = parseHelper<Floorplan>(services.Floorplans);
  const input = `
      floorplan
          floor f1 {
              room TestRoom at (1,2) size (10 x 12) walls [top: solid, right: solid, bottom: solid, left: solid]
          }
      `;

  const doc = await parse(input);
  const svg = await render(doc);
  const container = document.getElementById("app");
  if (!container) {
    throw new Error("Container not found");
  }
  container.innerHTML = svg;
}

main();
