import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
const pluralize = require('pluralize');

export function createQueriesResolver(
  type: Type,
  _tree: Tree,
  projectName: string
) {
    let fileTemplate = `import { Resolver, Args, Query, ID } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import { ${type.typeName}GetOneOutput } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-getOne.dto';
import {
  ${pluralize(type.typeName)}Pagination,
  ${pluralize(type.typeName)}PaginationArgs,
} from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-pagination.dto';
import { ${type.typeName}Service } from 'application/services/${strings.camelize(type.typeName)}.service';

@Resolver(${type.typeName})
export class ${type.typeName}QueriesResolver {
  constructor(private readonly ${strings.camelize(pluralize(type.typeName))}Service: ${type.typeName}Service) {}

  @Query(() => ${pluralize(type.typeName)}Pagination)
  async ${strings.camelize(pluralize(type.typeName))}Pagination(@Args() args: ${pluralize(type.typeName)}PaginationArgs) {
    return this.${strings.camelize(pluralize(type.typeName))}Service.${strings.camelize(pluralize(type.typeName))}Pagination(args);
  }

  @Query(() => ${type.typeName}GetOneOutput)
  async ${strings.camelize(type.typeName)}GetDataById(
  @Args({ name: '${strings.camelize(type.typeName)}Id', type: () => ID }) ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
  ) {
    return this.${strings.camelize(pluralize(type.typeName))}Service.${strings.camelize(type.typeName)}GetDataById(${strings.camelize(type.typeName)}Id);
  }

}\n`;
    // Create Service file
    _tree.create(
      `${projectName}/src/infrastructure/resolvers/${strings.camelize(
        type.typeName
      )}/${strings.camelize(
        type.typeName
      )}.queries.resolver.ts`,
      fileTemplate
    );
}

