import type { Floorplan } from "floorplans-language";
import type { LangiumDocument } from "langium";

export default async function render(
  document: LangiumDocument<Floorplan>
): Promise<string> {
  return "<svg></svg>";
}
