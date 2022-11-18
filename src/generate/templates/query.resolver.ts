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
    import { ${type.typeName}GetOneOutput } from 'application/services/dto/planet/planet-getOne.dto';
    import {
      ${type.typeName}sPagination,
      ${type.typeName}sPaginationArgs,
    } from 'application/services/dto/planet/planet-pagination.dto';
    import { ${type.typeName}Service } from 'application/services/planet.service';
    
    @Resolver(${type.typeName})
    export class ${type.typeName}QueriesResolver {
      constructor(private readonly planetsService: ${type.typeName}Service) {}
    
      @Query(() => ${type.typeName}sPagination)
      async planetsPagination(@Args() args: PlanetsPaginationArgs) {
        return this.planetsService.planetsPagination(args);
      }
    
      @Query(() => PlanetGetOneOutput)
      async planetGetDataById(
        @Args({ name: 'planetId', type: () => ID }) planetId: Planet['id'],
      ) {
        return this.planetsService.planetGetDataById(planetId);
      }
    }
    `;
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