"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneDto = void 0;
const core_1 = require("@angular-devkit/core");
function getOneDto(type, _tree, projectName) {
    let fileTemplate = `import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ${type.typeName}CreateOutput } from './${core_1.strings.camelize(type.typeName)}-create.dto';

@ObjectType()
export class ${type.typeName}GetOneOutput extends ${type.typeName}CreateOutput {}
    
    `;
    // Create Service file
    _tree.create(`${projectName}/src/application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-getOne.dto.ts`, fileTemplate);
}
exports.getOneDto = getOneDto;
//# sourceMappingURL=getOne.dto.js.map