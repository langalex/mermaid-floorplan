import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { parseHelper } from "langium/test";
import type { Floorplan } from "floorplans-language";
import { createFloorplansServices } from "floorplans-language";
import { readFileSync } from "fs";

let services: ReturnType<typeof createFloorplansServices>;
let parse: ReturnType<typeof parseHelper<Floorplan>>;

function expectNoErrors(document: LangiumDocument): void {
  if (document.parseResult.parserErrors.length) {
    console.error(document.parseResult.parserErrors);
  }
  expect(document.parseResult.parserErrors).toHaveLength(0);
  expect(document.parseResult.value).toBeDefined(); // TODO: this is not working
}

beforeAll(async () => {
  services = createFloorplansServices(EmptyFileSystem);
  parse = parseHelper<Floorplan>(services.Floorplans);

  // activate the following if your linking test requires elements from a built-in library, for example
  // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});
describe("Floorplan Langium Parser Tests", () => {
  test.only("should parse basic floorplan structure", async () => {
    const input = `
      floorplan
          floor f1 {
              room TestRoom at (0,0) size (10 x 10) walls [top: solid, right: solid, bottom: solid, left: solid]
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const model = document.parseResult.value;
    expect(model.floors).toHaveLength(1);
    expect(model.floors[0]?.id).toBe("f1");
    expect(model.floors[0]?.rooms).toHaveLength(1);

    const room = model.floors[0]?.rooms[0];
    expect(room?.name).toBe("TestRoom");
    expect(room?.position?.x).toBe(0);
    expect(room?.position?.y).toBe(0);
    expect(room?.size?.width).toBe(10);
    expect(room?.size?.height).toBe(10);
  });

  test("should parse test-floorplan.fp file with Langium", async () => {
    const input = readFileSync("./test/fixtures/test-floorplan.fp", "utf-8");

    const document = await parse(input);
    expectNoErrors(document);

    const model = document.parseResult.value;

    // Validate basic structure
    expect(model.floors).toHaveLength(1);
    expect(model.connections).toHaveLength(3);

    const floor = model.floors[0];
    expect(floor?.id).toBe("1");
    expect(floor?.rooms).toHaveLength(3);

    // Validate rooms
    const rooms = floor?.rooms || [];
    const roomNames = rooms.map((r) => r.name);
    expect(roomNames).toContain("MasterBathroom");
    expect(roomNames).toContain("MasterBedroom");
    expect(roomNames).toContain("WalkInCloset");

    // Validate MasterBathroom details
    const masterBathroom = rooms.find((r) => r.name === "MasterBathroom");
    expect(masterBathroom?.position?.x).toBe(0);
    expect(masterBathroom?.position?.y).toBe(0);
    expect(masterBathroom?.size?.width).toBe(15);
    expect(masterBathroom?.size?.height).toBe(8);
    expect(masterBathroom?.label).toBe('"Master Bathroom"');

    // Validate sub-rooms
    expect(masterBathroom?.subRooms).toHaveLength(1);
    const toilet = masterBathroom?.subRooms?.[0];
    expect(toilet?.name).toBe("Toilet1");
    expect(toilet?.label).toBe('"Toilet"');

    // Validate wall specifications
    const walls = masterBathroom?.walls?.specifications;
    expect(walls).toHaveLength(4);

    const wallTypes = walls?.map((w) => ({
      direction: w.direction,
      type: w.type,
    }));
    expect(wallTypes).toEqual([
      { direction: "top", type: "solid" },
      { direction: "right", type: "solid" },
      { direction: "bottom", type: "door" },
      { direction: "left", type: "solid" },
    ]);

    // Validate connections
    const connections = model.connections;
    expect(connections).toHaveLength(3);

    const firstConnection = connections[0];
    expect(firstConnection?.from?.room?.name).toBe("MasterBathroom");
    expect(firstConnection?.from?.wall).toBe("right");
    expect(firstConnection?.to?.room?.name).toBe("MasterBedroom");
    expect(firstConnection?.to?.wall).toBe("left");
    expect(firstConnection?.doorType).toBe("door");
    expect(firstConnection?.position).toBe(0);

    // Validate connection to outside
    const outsideConnection = connections[2];
    expect(outsideConnection?.from?.room?.name).toBe("MasterBedroom");
    expect(outsideConnection?.from?.wall).toBe("top");
    expect(outsideConnection?.to?.room?.name).toBe("outside");
    expect(outsideConnection?.doorType).toBe("double-door");
    expect(outsideConnection?.position).toBe(100);
  });

  test("should parse room with multiple wall types", async () => {
    const input = `
      floorplan
          floor 1 {
              room MultiWallRoom at (5,5) size (8x6) walls [
                  top: solid, 
                  right: window, 
                  bottom: door, 
                  left: open
              ] label "Multi Wall Room"
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const model = document.parseResult.value;
    const room = model.floors[0]?.rooms[0];
    const walls = room?.walls?.specifications;

    expect(walls).toHaveLength(4);
    expect(walls?.find((w) => w.direction === "top")?.type).toBe("solid");
    expect(walls?.find((w) => w.direction === "right")?.type).toBe("window");
    expect(walls?.find((w) => w.direction === "bottom")?.type).toBe("door");
    expect(walls?.find((w) => w.direction === "left")?.type).toBe("open");
  });

  test("should parse connections with different options", async () => {
    const input = `
      floorplan
          floor 1 {
              room RoomA at (0,0) size (5x5) walls [top: solid, right: door, bottom: solid, left: solid]
              room RoomB at (5,0) size (5x5) walls [top: solid, right: solid, bottom: solid, left: door]
          }
          connect RoomA.right to RoomB.left door at 50% opens into RoomA swing: left
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const connection = document.parseResult.value.connections[0];
    expect(connection?.position).toBe(50);
    expect(connection?.opensInto?.name).toBe("RoomA");
    expect(connection?.swing).toBe("left");
  });

  test("should parse complex nested room structure", async () => {
    const input = `
      floorplan
          floor 1 {
              room MainRoom at (0,0) size (20x15) walls [top: solid, right: solid, bottom: solid, left: solid] composed of [
                  sub-room Closet at (15,0) size (5x5) walls [top: solid, right: solid, bottom: solid, left: door]
                  sub-room Bathroom at (0,10) size (8x5) walls [top: door, right: solid, bottom: solid, left: solid] composed of [
                      sub-room Toilet at (0,0) size (3x3) walls [top: solid, right: door, bottom: solid, left: solid]
                  ]
              ]
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const model = document.parseResult.value;
    const mainRoom = model.floors[0]?.rooms[0];

    expect(mainRoom?.subRooms).toHaveLength(2);

    const closet = mainRoom?.subRooms?.find((r) => r.name === "Closet");
    expect(closet?.size?.width).toBe(5);
    expect(closet?.size?.height).toBe(5);

    const bathroom = mainRoom?.subRooms?.find((r) => r.name === "Bathroom");
    expect(bathroom?.subRooms).toHaveLength(1);

    const toilet = bathroom?.subRooms?.[0];
    expect(toilet?.name).toBe("Toilet");
    expect(toilet?.size?.width).toBe(3);
  });

  test("should parse grammar file structure", () => {
    const grammarContent = readFileSync("./grammar/floorplan.langium", "utf-8");

    // Test that grammar file exists and has basic structure
    expect(grammarContent).toContain("grammar Floorplan");
    expect(grammarContent).toContain("entry Floorplan:");

    // Test that all required rules are present
    expect(grammarContent).toMatch(/Floor:/);
    expect(grammarContent).toMatch(/Room:/);
    expect(grammarContent).toMatch(/Connection:/);
    expect(grammarContent).toMatch(/WallSpec:/);
    expect(grammarContent).toMatch(/Coordinate:/);
    expect(grammarContent).toMatch(/Dimension:/);

    // Test terminal rules
    expect(grammarContent).toMatch(/terminal ID:/);
    expect(grammarContent).toMatch(/terminal NUMBER/);
    expect(grammarContent).toMatch(/terminal STRING:/);
  });
});
