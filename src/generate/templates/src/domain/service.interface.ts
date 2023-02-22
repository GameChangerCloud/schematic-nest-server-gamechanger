import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
const pluralize = require('pluralize');

export function createServiceInterface(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let [fieldPagination, importPaginationArgs, importFieldPagination] = computeFieldPagination(type);
    let fileTemplate = `import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';${importPaginationArgs}${importFieldPagination}
import {
  ${type.typeName}CreateInput,
  ${type.typeName}CreateOutput,
} from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-create.dto';
import { ${type.typeName}DeleteOutput } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-delete.dto';
import { ${type.typeName}GetOneOutput } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-getOne.dto';
import {
  ${pluralize(type.typeName)}Pagination,
  ${pluralize(type.typeName)}PaginationArgs,
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

  ${strings.camelize(pluralize(type.typeName))}Pagination(args: ${pluralize(type.typeName)}PaginationArgs): Promise<${pluralize(type.typeName)}Pagination>;

  ${strings.camelize(type.typeName)}GetById(id: ${type.typeName}['id']): Promise<${type.typeName}>;

  ${strings.camelize(type.typeName)}GetDataById(id: ${type.typeName}['id']): Promise<${type.typeName}GetOneOutput>;${fieldPagination}
}
`;

  _tree.create(
    `${projectName}/src/domain/service/${strings.camelize(
      type.typeName
    )}.service.interface.ts`,
    fileTemplate
  );
}

function computeFieldPagination(type: Type): string[] {
  let fieldPagination = '';
  let importPaginationArgs = '';
  let importFieldPagination = '';
  const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.isArray && field.relationType !== 'selfJoinMany');
  if(relatedFields.length > 0) {
    relatedFields.forEach((relatedField) => {
      fieldPagination += `

  ${strings.camelize(type.typeName)}${strings.capitalize(relatedField.name)}Pagination(
    ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    args: PaginationArgs,
  ): Promise<${type.typeName}${strings.capitalize(relatedField.name)}Pagination>;`;
    importFieldPagination += `
import { ${type.typeName}${strings.capitalize(relatedField.name)}Pagination } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-${relatedField.name}-pagination.dto';`;
    });
    importPaginationArgs = `
import { PaginationArgs } from 'application/services/dto/pagination/pagination.dto';`;
  }
  
  return [fieldPagination, importPaginationArgs, importFieldPagination];
}