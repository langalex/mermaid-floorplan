// import type { ValidationAcceptor, ValidationChecks } from "langium";
// import type { FloorplansAstType, Person } from "./generated/ast.js";
import type { FloorplansServices } from "./floorplans-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FloorplansServices) {
  //   const registry = services.validation.ValidationRegistry;
  //   const validator = services.validation.FloorplansValidator;
  //   const checks: ValidationChecks<FloorplansAstType> = {
  // : validator.checkPersonStartsWithCapital
  // };
  //   registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class FloorplansValidator {
  checkPersonStartsWithCapital(): // person: Person,
  // accept: ValidationAcceptor
  void {
    // if (person.name) {
    //   const firstChar = person.name.substring(0, 1);
    //   if (firstChar.toUpperCase() !== firstChar) {
    //     accept("warning", "Person name should start with a capital.", {
    //       node: person,
    //       property: "name",
    //     });
    //   }
    // }
  }
}
