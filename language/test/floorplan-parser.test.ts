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
  test("should parse basic floorplan structure", async () => {
    const input = `
      floorplan
          floor f1 {
              room TestRoom at (1,2) size (10 x 12) walls [top: solid, right: solid, bottom: solid, left: solid]
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
    expect(room?.position?.x).toBe(1);
    expect(room?.position?.y).toBe(2);
    expect(room?.size?.width).toBe(10);
    expect(room?.size?.height).toBe(12);
    expect(room?.walls?.specifications).toHaveLength(4);
  });

  test("should parse room with multiple wall types", async () => {
    const input = `
      floorplan
          floor f1 {
              room MultiWallRoom at (5,5) size (8 x 6) walls [
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
          floor f1 {
              room RoomA at (0,0) size (5 x 5) walls [top: solid, right: door, bottom: solid, left: solid]
              room RoomB at (5,0) size (5 x 5) walls [top: solid, right: solid, bottom: solid, left: door]
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
          floor f1 {
              room MainRoom at (0,0) size (20 x 15) walls [top: solid, right: solid, bottom: solid, left: solid] composed of [
                  sub-room Closet at (15,0) size (5 x 5) walls [top: solid, right: solid, bottom: solid, left: door]
                  sub-room Bathroom at (0,10) size (8 x 5) walls [top: door, right: solid, bottom: solid, left: solid] composed of [
                      sub-room Toilet at (0,0) size (3 x 3) walls [top: solid, right: door, bottom: solid, left: solid]
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

  test("should parse sub-room type explicitly", async () => {
    const input = `
      floorplan
          floor f1 {
              sub-room SubRoom at (10,10) size (4 x 4) walls [top: solid, right: solid, bottom: solid, left: solid]
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const room = document.parseResult.value.floors[0]?.rooms[0];
    expect(room?.type).toBe("sub-room");
    expect(room?.name).toBe("SubRoom");
  });

  test("should parse wall references with and without wall direction", async () => {
    const input = `
      floorplan
          floor f1 {
              room RoomA at (0,0) size (5 x 5) walls [top: solid, right: door, bottom: solid, left: solid]
              room RoomB at (5,0) size (5 x 5) walls [top: solid, right: solid, bottom: solid, left: door]
          }
          connect RoomA.right to RoomB.left door
          connect RoomA to RoomB door
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const connections = document.parseResult.value.connections;
    expect(connections[0]?.from?.wall).toBe("right");
    expect(connections[0]?.to?.wall).toBe("left");
    expect(connections[1]?.from?.wall).toBeUndefined();
    expect(connections[1]?.to?.wall).toBeUndefined();
  });

  test("should parse connections with all optional properties", async () => {
    const input = `
      floorplan
          floor f1 {
              room RoomA at (0,0) size (5 x 5) walls [top: solid, right: door, bottom: solid, left: solid]
              room RoomB at (5,0) size (5 x 5) walls [top: solid, right: solid, bottom: solid, left: door]
          }
          connect RoomA.right to RoomB.left double-door at 75% opens into RoomB swing: right
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const connection = document.parseResult.value.connections[0];
    expect(connection?.doorType).toBe("double-door");
    expect(connection?.position).toBe(75);
    expect(connection?.opensInto?.name).toBe("RoomB");
    expect(connection?.swing).toBe("right");
  });

  test("should parse empty floor", async () => {
    const input = `
      floorplan
          floor f1 {
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const floor = document.parseResult.value.floors[0];
    expect(floor?.rooms).toHaveLength(0);
  });

  test("should parse floorplan with no floors or connections", async () => {
    const input = `floorplan`;

    const document = await parse(input);
    expectNoErrors(document);

    const model = document.parseResult.value;
    expect(model.floors).toHaveLength(0);
    expect(model.connections).toHaveLength(0);
  });

  test("should parse multiple floors and connections", async () => {
    const input = `
      floorplan
          floor f1 {
              room RoomA at (0,0) size (5 x 5) walls [top: solid, right: door, bottom: solid, left: solid]
          }
          floor f2 {
              room RoomB at (0,0) size (5 x 5) walls [top: solid, right: solid, bottom: solid, left: door]
          }
          connect RoomA.right to outside door
          connect outside to RoomB.left door
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const model = document.parseResult.value;
    expect(model.floors).toHaveLength(2);
    expect(model.connections).toHaveLength(2);
    expect(model.floors[0]?.id).toBe("f1");
    expect(model.floors[1]?.id).toBe("f2");
  });

  test("should parse comments", async () => {
    const input = `
      /* This is a multi-line comment */
      floorplan
          # This is a single-line comment
          floor f1 {
              room RoomA at (0,0) size (5 x 5) walls [top: solid, right: door, bottom: solid, left: solid] # Room comment
          }
          /* Connection comment */
          connect RoomA.right to outside door
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const model = document.parseResult.value;
    expect(model.floors).toHaveLength(1);
    expect(model.connections).toHaveLength(1);
  });

  test("should parse decimal numbers", async () => {
    const input = `
      floorplan
          floor f1 {
              room RoomA at (1.5,2.75) size (10.5 x 12.25) walls [top: solid, right: solid, bottom: solid, left: solid]
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const room = document.parseResult.value.floors[0]?.rooms[0];
    expect(room?.position?.x).toBe(1.5);
    expect(room?.position?.y).toBe(2.75);
    expect(room?.size?.width).toBe(10.5);
    expect(room?.size?.height).toBe(12.25);
  });

  test("should parse room with label", async () => {
    const input = `
      floorplan
          floor f1 {
              room TestRoom at (1,2) size (10 x 12) walls [top: solid, right: solid, bottom: solid, left: solid] label "Test Room Label"
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const room = document.parseResult.value.floors[0]?.rooms[0];
    expect(room?.label).toBe("Test Room Label");
  });

  test("should parse room without label", async () => {
    const input = `
      floorplan
          floor f1 {
              room TestRoom at (1,2) size (10 x 12) walls [top: solid, right: solid, bottom: solid, left: solid]
          }
      `;

    const document = await parse(input);
    expectNoErrors(document);

    const room = document.parseResult.value.floors[0]?.rooms[0];
    expect(room?.label).toBeUndefined();
  });
});
