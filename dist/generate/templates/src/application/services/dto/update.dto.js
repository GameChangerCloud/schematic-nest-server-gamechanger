"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDto = void 0;
const core_1 = require("@angular-devkit/core");
function updateDto(type, _tree, projectName) {
    let fileTemplate = `import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${core_1.strings.camelize(type.typeName)}.model';
import {
  ${type.typeName}CreateInput,
  ${type.typeName}CreateOutput,
} from './${core_1.strings.camelize(type.typeName)}-create.dto';

@InputType()
export class ${type.typeName}UpdateInput extends ${type.typeName}CreateInput {}

@ObjectType()
export class ${type.typeName}UpdateOutput extends ${type.typeName}CreateOutput{
  @Field(() => ${type.typeName})
  ${core_1.strings.camelize(type.typeName)}: ${type.typeName};
}

    `;
    // Create Service file
    _tree.create(`${projectName}/src/application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-update.dto.ts`, fileTemplate);
}
exports.updateDto = updateDto;
//# sourceMappingURL=update.dto.js.map