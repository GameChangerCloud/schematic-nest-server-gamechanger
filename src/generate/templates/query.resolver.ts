import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

/**
 * Create service file in the new project for each entity
 * @param types Detailed JSON about the graphQL schema used for the generation
 * @param _tree Current tree where files are created
 * @param projectName name of the generated project
 */
export function createResolverQuery(
  type: Type,
  _tree: Tree,
  projectName: string
) {
    let serviceFileTemplate = `import { Resolver, Args, Query, ID } from '@nestjs/graphql';
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
      `${projectName}/src/app/store/service/${strings.camelize(
        type.typeName
      )}.resolver.ts`,
      serviceFileTemplate
    );
}