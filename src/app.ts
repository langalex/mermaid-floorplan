import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import type { Floorplan } from "floorplans-language";
import { createFloorplansServices } from "floorplans-language";
import render from "./renderer.js";

const services = createFloorplansServices(EmptyFileSystem);
const parse = parseHelper<Floorplan>(services.Floorplans);

export default async function main(): Promise<void> {
  const input = document.getElementById("input") as HTMLTextAreaElement | null;
  if (!input) {
    throw new Error("Input not found");
  }
  const container = document.getElementById("svg") as SVGElement | null;
  if (!container) {
    throw new Error("Container not found");
  }
  container.innerHTML = await renderSvg(input.value);
  input.addEventListener("input", async () => {
    try {
      container.innerHTML = await renderSvg(input.value);
    } catch (error) {
      container.innerHTML = `<div style="color: red;">${
        (error as Error).message
      }</div>`;
    }
  });
}

async function renderSvg(input: string): Promise<string> {
  const doc = await parse(input);
  if (doc.parseResult.parserErrors.length) {
    throw new Error(doc.parseResult.parserErrors.join("\n"));
  }
  const svg = await render(doc);
  return svg;
}

main();
