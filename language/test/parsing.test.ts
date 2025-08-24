import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import type { Floorplan } from "floorplans-language";
import { createFloorplansServices, isFloorplan } from "floorplans-language";

let services: ReturnType<typeof createFloorplansServices>;
let parse:    ReturnType<typeof parseHelper<Floorplan>>;
let document: LangiumDocument<Floorplan> | undefined;

beforeAll(async () => {
    services = createFloorplansServices(EmptyFileSystem);
    parse = parseHelper<Floorplan>(services.Floorplans);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    test('parse simple Floorplan', async () => {
        document = await parse(`
            person Langium
            Hello Langium!
        `);

        // check for absence of parser errors the classic way:
        //  deactivated, find a much more human readable way below!
        // expect(document.parseResult.parserErrors).toHaveLength(0);

        expect(
            // here we use a (tagged) template expression to create a human readable representation
            //  of the AST part we are interested in and that is to be compared to our expectation;
            // prior to the tagged template expression we check for validity of the parsed document object
            //  by means of the reusable function 'checkDocumentValid()' to sort out (critical) typos first;
            checkDocumentValid(document) || s`
                Persons:
                  ${document.parseResult.value?.persons?.map(p => p.name)?.join('\n  ')}
                Greetings to:
                  ${document.parseResult.value?.greetings?.map(g => g.person.$refText)?.join('\n  ')}
            `
        ).toBe(s`
            Persons:
              Langium
            Greetings to:
              Langium
        `);
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isFloorplan(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a 'Floorplan'.`
        || undefined;
}
