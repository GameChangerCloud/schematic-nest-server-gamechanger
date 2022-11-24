"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDto = void 0;
const core_1 = require("@angular-devkit/core");
function deleteDto(type, _tree, projectName) {
    let fileTemplate = `import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${core_1.strings.camelize(type.typeName)}.model';

@ObjectType()
export class ${type.typeName}DeleteOutput {
  @Field(() => ID)
  ${core_1.strings.camelize(type.typeName)}: ${type.typeName}['id'];
}

    `;
    // Create Service file
    _tree.create(`${projectName}/src/application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-delete.dto.ts`, fileTemplate);
}
exports.deleteDto = deleteDto;
//# sourceMappingURL=delete.dto.js.map