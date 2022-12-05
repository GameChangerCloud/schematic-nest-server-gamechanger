import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createResolverFields(
  type: Type,
  _tree: Tree,
  projectName: string
) {


  let typeName = type.typeName
  
  let entityFieldsResolvertemplate = 
`import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.decamelize(type.typeName)}.model';
${generateRelationsModelImports(type)}
${generateEntityResolverRelationsServicesImport(type)}


 
@Resolver(${typeName})
export class ${typeName}FieldsResolver {
  constructor(
    ${generateFieldsResolversConstructorServices(type)}
  ) {}
  
  ${generateResolveFields(type)}
`;

  // Create Service file
  _tree.create(
    `${projectName}/src/infrastructure/resolvers/${strings.decamelize(type.typeName)}/${strings.decamelize(type.typeName)}.fields.resolver.ts`,
    entityFieldsResolvertemplate
  );
}

function generateRelationsModelImports(type: Type): string {
  let template =
`import { Planet } from 'adapters/typeorm/entities/planet.model';
import { User } from 'adapters/typeorm/entities/user.model';`
  type
  return template
}

function generateEntityResolverRelationsServicesImport(type: Type): string {
  let template =
`import { PlanetService } from 'application/services/planet.service';
import { UserService } from 'application/services/user.service';`
  type
  return template
}

function generateFieldsResolversConstructorServices(type:Type): string {
  let template =
`private planetService: PlanetService,
private userService: UserService,`
    type
    return template
}


function generateResolveFields(type:Type): string {
  // let typeName = type.typeName
  let template =
`@ResolveField(() => Planet, { nullable: true })
async planet(@Parent() astronaut: Astronaut) {
  if (!astronaut.planetId) {
    return null;
  }
  try {
    return await this.planetService.planetGetById(astronaut.planetId);
  } catch (err) {
    return null;
  }
}

@ResolveField(() => User, { nullable: true })
async user(@Parent() astronaut: Astronaut) {
  if (!astronaut.userId) {
    return null;
  }
  try {
    return await this.userService.userGetById(astronaut.userId);
  } catch (err) {
    return null;
  }
}`
    type
    return template
}


