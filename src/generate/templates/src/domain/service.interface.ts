import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
const pluralize = require("pluralize");

export function createServiceInterface(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import {
  ${type.typeName}CreateInput,
  ${type.typeName}CreateOutput,
} from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-create.dto';
import { ${type.typeName}DeleteOutput } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-delete.dto';
import { ${type.typeName}GetOneOutput } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-getOne.dto';
import {
  ${type.typeName}sPagination,
  ${type.typeName}sPaginationArgs,
} from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-pagination.dto';
import {
  ${type.typeName}UpdateInput,
  ${type.typeName}UpdateOutput,
} from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-update.dto';

export interface I${type.typeName}Service {
  ${strings.camelize(type.typeName)}Create(input: ${type.typeName}CreateInput): Promise<${type.typeName}CreateOutput>;

  ${strings.camelize(type.typeName)}Update(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    input: ${type.typeName}UpdateInput,
  ): Promise<${type.typeName}UpdateOutput>;

  ${strings.camelize(type.typeName)}Delete(${strings.camelize(type.typeName)}Id: ${type.typeName}['id']): Promise<${type.typeName}DeleteOutput>;

  ${strings.camelize(pluralize(type.typeName))}sPagination(
    args: ${type.typeName}sPaginationArgs,
  ): Promise<${type.typeName}sPagination>;

  ${strings.camelize(type.typeName)}GetById(id: ${type.typeName}['id']): Promise<${type.typeName}>;

  ${strings.camelize(type.typeName)}GetDataById(id: ${type.typeName}['id']): Promise<${type.typeName}GetOneOutput>;
}
`;
    // Create Service file
    _tree.create(
      `${projectName}/src/domain/service/${strings.camelize(
        type.typeName
      )}.service.interface.ts`,
      fileTemplate
    );
}