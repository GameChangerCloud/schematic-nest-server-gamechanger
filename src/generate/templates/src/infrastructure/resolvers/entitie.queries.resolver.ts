import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createResolverQuery(
  type: Type,
  _tree: Tree,
  projectName: string
) {
    let fileTemplate = `import { Resolver, Args, Query, ID } from '@nestjs/graphql';
    import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
    import { ${type.typeName}GetOneOutput } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-getOne.dto';
    import {
      ${type.typeName}sPagination,
      ${type.typeName}sPaginationArgs,
    } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-pagination.dto';
    import { ${type.typeName}Service } from 'application/services/${strings.camelize(type.typeName)}.service';
    
    @Resolver(${type.typeName})
    export class ${type.typeName}QueriesResolver {
      constructor(private readonly ${strings.camelize(type.typeName)}sService: ${type.typeName}Service) {}
    
      @Query(() => ${type.typeName}sPagination)
      async ${strings.camelize(type.typeName)}sPagination(@Args() args: ${type.typeName}sPaginationArgs) {
        return this.${strings.camelize(type.typeName)}sService.${strings.camelize(type.typeName)}sPagination(args);
      }
    
      @Query(() => ${type.typeName}GetOneOutput)
      async ${strings.camelize(type.typeName)}GetDataById(
        @Args({ name: '${strings.camelize(type.typeName)}Id', type: () => ID }) ${strings.camelize(type.typeName)}Id: ${type.typeName}['id'],
      ) {
        return this.${strings.camelize(type.typeName)}sService.${strings.camelize(type.typeName)}GetDataById(${strings.camelize(type.typeName)}Id);
      }
    }
    `;

  _tree.create(
    `${projectName}/src/infrastructure/resolvers/${strings.camelize(
      type.typeName
    )}/${strings.camelize(
      type.typeName
    )}.queries.resolver.ts`,
    fileTemplate
  );
}

