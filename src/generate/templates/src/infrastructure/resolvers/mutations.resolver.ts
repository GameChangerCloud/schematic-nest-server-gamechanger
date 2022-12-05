import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
const pluralize = require('pluralize');

export function createMutationsResolver(
  type: Type,
  _tree: Tree,
  projectName: string
) {
    let fileTemplate = `import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import { ${type.typeName}Service } from 'application/services/${strings.camelize(type.typeName)}.service';
import {
  ${type.typeName}CreateInput,
  ${type.typeName}CreateOutput,
} from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-create.dto';
import { ${type.typeName}DeleteOutput } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-delete.dto';
import {
  ${type.typeName}UpdateOutput,
  ${type.typeName}UpdateInput,
} from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-update.dto';

@Resolver(${type.typeName})
export class ${type.typeName}MutationsResolver {
  constructor(private readonly ${strings.camelize(pluralize(type.typeName))}Service: ${type.typeName}Service) {}

  @Mutation(() => ${type.typeName}CreateOutput)
  async ${strings.camelize(type.typeName)}Create(@Args('input') input: ${type.typeName}CreateInput) {
    return this.${strings.camelize(pluralize(type.typeName))}Service.${strings.camelize(type.typeName)}Create(input);
  }

  @Mutation(() => ${type.typeName}UpdateOutput)
  async ${strings.camelize(type.typeName)}Update(
    @Args({ name: '${strings.camelize(type.typeName)}Id', type: () => ID })${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
    @Args('input') input: ${type.typeName}UpdateInput,
  ) {
    return this.${strings.camelize(pluralize(type.typeName))}Service.${strings.camelize(type.typeName)}Update(${strings.camelize(type.typeName)}Id, input);
  }

  @Mutation(() => ${type.typeName}DeleteOutput)
  async ${strings.camelize(type.typeName)}Delete(
    @Args({ name: '${strings.camelize(type.typeName)}Id', type: () => ID }) ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
  ) {
    return this.${strings.camelize(pluralize(type.typeName))}Service.${strings.camelize(type.typeName)}Delete(${strings.camelize(type.typeName)}Id);
  }
}
`;
    // Create Service file
    _tree.create(
      `${projectName}/src/infrastructure/resolvers/${strings.camelize(
        type.typeName
      )}/${strings.camelize(
        type.typeName
      )}.mutations.resolver.ts`,
      fileTemplate
    );
}

