"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceInterface = void 0;
const core_1 = require("@angular-devkit/core");
const pluralize = require("pluralize");
function createServiceInterface(type, _tree, projectName) {
    let fileTemplate = `
import { ${type.typeName} } from 'adapters/typeorm/entities/${core_1.strings.camelize(type.typeName)}.model';
import {
  ${type.typeName}CreateInput,
  ${type.typeName}CreateOutput,
} from 'application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-create.dto';
import { ${type.typeName}DeleteOutput } from 'application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-delete.dto';
import { ${type.typeName}GetOneOutput } from 'application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-getOne.dto';
import {
  ${type.typeName}sPagination,
  ${type.typeName}sPaginationArgs,
} from 'application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-pagination.dto';
import {
  ${type.typeName}UpdateInput,
  ${type.typeName}UpdateOutput,
} from 'application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-update.dto';

export interface I${type.typeName}Service {
  ${core_1.strings.camelize(type.typeName)}Create(input: ${type.typeName}CreateInput): Promise<${type.typeName}CreateOutput>;

  ${core_1.strings.camelize(type.typeName)}Update(
    ${core_1.strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    input: ${type.typeName}UpdateInput,
  ): Promise<${type.typeName}UpdateOutput>;

  ${core_1.strings.camelize(type.typeName)}Delete(${core_1.strings.camelize(type.typeName)}Id: ${type.typeName}['id']): Promise<${type.typeName}DeleteOutput>;

  ${core_1.strings.camelize(pluralize(type.typeName))}sPagination(
    args: ${type.typeName}sPaginationArgs,
  ): Promise<${type.typeName}sPagination>;

  ${core_1.strings.camelize(type.typeName)}GetById(id: ${type.typeName}['id']): Promise<${type.typeName}>;

  ${core_1.strings.camelize(type.typeName)}GetDataById(id: ${type.typeName}['id']): Promise<${type.typeName}GetOneOutput>;
}
`;
    // Create Service file
    _tree.create(`${projectName}/src/domain/service/${core_1.strings.camelize(type.typeName)}.service.interface.ts`, fileTemplate);
}
exports.createServiceInterface = createServiceInterface;
//# sourceMappingURL=service.interface.js.map