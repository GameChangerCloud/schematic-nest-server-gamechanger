"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeOrmEnumFile = void 0;
const core_1 = require("@angular-devkit/core");
function createTypeOrmEnumFile(type, _tree, projectName) {
    console.log('Enum generation :', type);
    let typeName = type.typeName;
    let entitieEnumTemplate = generateEntitieEnumTemplate(type);
    let enumFileTemplate = `
    import { registerEnumType } from '@nestjs/graphql';

   ${entitieEnumTemplate}
    
    registerEnumType(${typeName}, {
      name: '${typeName}',
    });
  `;
    // Create Service file
    _tree.create(`${projectName}/src/adapters/typerorm/entities/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}.enum.ts`, enumFileTemplate);
}
exports.createTypeOrmEnumFile = createTypeOrmEnumFile;
function generateEntitieEnumTemplate(type) {
    let typeName = type.typeName;
    let enumListTemplate = `
  ROOKIE = 'rookie',
  ENSIGN = 'ensign',
  LIEUTENANT = 'lieutenant',
  COMMANDER = 'commander',
  CAPTAIN = 'captain',
  `;
    let entitieEnumTemplate = `
  export enum ${typeName} {
    ${enumListTemplate}
  }
  `;
    return entitieEnumTemplate;
}
//# sourceMappingURL=enum.model.js.map