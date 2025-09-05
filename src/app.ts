import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import type { Floorplan } from "floorplans-language";
import { createFloorplansServices } from "floorplans-language";
import render from "./renderer.js";
import { initializeEditor } from "./editor.js";

const services = createFloorplansServices(EmptyFileSystem);
const parse = parseHelper<Floorplan>(services.Floorplans);

export default async function main(): Promise<void> {
  const editorTemplate = document.getElementById(
    "editor-template"
  ) as HTMLTemplateElement | null;
  const initialContent = editorTemplate?.content?.textContent?.trim();

  const container = document.getElementById("svg") as SVGElement | null;
  if (!container) {
    throw new Error("Container not found");
  }

  const editorInstance = await initializeEditor(
    "editor-container",
    initialContent ?? ""
  );

  // Initial render
  try {
    container.innerHTML = await renderSvg(editorInstance.getValue());
  } catch (error) {
    container.innerHTML = `<div style="color: red;">${
      (error as Error).message
    }</div>`;
  }

  // Listen for editor changes
  editorInstance.onDidChangeModelContent(async () => {
    try {
      container.innerHTML = await renderSvg(editorInstance.getValue());
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
