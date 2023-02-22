import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
const pluralize = require('pluralize');

export function createEntityPaginationDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import {
  Pagination,
  PaginationArgs,
  PaginationSortBy,
  SortDirection,
} from 'application/services/dto/pagination/pagination.dto';

@InputType('${pluralize(type.typeName)}PaginationSortBy')
export class ${pluralize(type.typeName)}PaginationSortBy extends PaginationSortBy {${handleSortingArguments(type)}}

@ArgsType()
export class ${pluralize(type.typeName)}PaginationArgs extends PaginationArgs {
  @Field(() => ${pluralize(type.typeName)}PaginationSortBy, { nullable: true })
  sortBy?: ${pluralize(type.typeName)}PaginationSortBy;
}

@ObjectType('${pluralize(type.typeName)}Pagination')
export class ${pluralize(type.typeName)}Pagination extends Pagination {
  @Field(() => [${type.typeName}])
  nodes: ${type.typeName}[];
}\n`;

  _tree.create(
    `${projectName}/src/application/services/dto/${
      type.typeName.toLowerCase()
  }/${
      type.typeName.toLowerCase()
  }-pagination.dto.ts`,
    fileTemplate
  );
}

function handleSortingArguments(type: Type): string {
  let sortingArgs = '';
  type.fields.forEach((field) => {
    if(field.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === 'SortBy'))
    sortingArgs += `\n  @Field(() => SortDirection, { nullable: true })\n  ${strings.camelize(field.name)}?: SortDirection;\n`;
  });
  return sortingArgs;
}