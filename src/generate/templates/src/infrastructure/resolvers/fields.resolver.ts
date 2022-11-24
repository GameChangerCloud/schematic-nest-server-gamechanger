import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';
// const pluralize = require("pluralize");

export function createFieldsResolver(
  type: Type,
  relatedFields: Field[],
  _tree: Tree,
  projectName: string
) {
    let arrayFields = relatedFields.filter(field => field.isArray);
    let argsImport = arrayFields.length > 0 ? 'Args, ' : '';
    let fileTemplate = `import { ${argsImport}Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.decamelize(type.typeName)}.model';${generateImports(type, relatedFields)}

@Resolver(${type.typeName})
export class ${type.typeName}FieldsResolver {
  constructor(${generateConstructor(type, relatedFields)}
  ) {}${generateResolveFields(type, relatedFields)}
}
`;

  // Create Service file
  _tree.create(
    `${projectName}/src/infrastructure/resolvers/${strings.decamelize(type.typeName)}/${strings.decamelize(type.typeName)}.fields.resolver.ts`,
    fileTemplate
  );
}

function generateImports(type: Type, relatedFields: Field[]): string {
  let importsTemplate = '';
  let arrayFields = false;
  relatedFields.forEach((field: Field) => {
    if (field.isArray) {
      arrayFields = true;
      importsTemplate += `
import { ${type.typeName}${strings.capitalize(field.name)}Pagination } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-${strings.camelize(field.name)}-pagination.dto';`;
    } else {
      importsTemplate += `
import { ${field.type} } from 'adapters/typeorm/entities/${strings.camelize(field.type)}.model';
import { ${field.type}Service } from 'application/services/${strings.camelize(field.type)}.service';`;
    }
  });
  if (arrayFields) importsTemplate += `
import { ${type.typeName}Service } from 'application/services/${strings.camelize(type.typeName)}.service';
import { PaginationArgs } from 'application/services/dto/pagination/pagination.dto';`;
  return importsTemplate;
}

function generateConstructor(type: Type, relatedFields: Field[]): string {
  let constructor = '';
  let arrayFields = false;
  relatedFields.forEach((field: Field) => {
    if (field.isArray) arrayFields = true;
    else constructor += `
    private ${strings.camelize(field.type)}Service: ${field.type}Service,`;
  });

  if (arrayFields) constructor += `
    private ${strings.camelize(type.typeName)}Service: ${type.typeName}Service,`;
  return constructor;
}



function generateResolveFields(type: Type, relatedFields: Field[]): string {
  let resolvedFields = '';
  relatedFields.forEach((field: Field) => {
    if (field.isArray) {
      resolvedFields += `

  @ResolveField(() => ${type.typeName}${strings.capitalize(field.name)}Pagination)
  async ${field.name}(@Parent() ${strings.camelize(type.typeName)}: ${type.typeName}, @Args() args: PaginationArgs) {
    return await this.${strings.camelize(type.typeName)}Service.${strings.camelize(type.typeName)}${strings.capitalize(field.name)}Pagination(${strings.camelize(type.typeName)}.id, args);
  }`;
    } else {
      resolvedFields += `

  @ResolveField(() => ${field.type}, { nullable: true })
  async ${field.name}(@Parent() ${strings.camelize(type.typeName)}: ${type.typeName}) {
    if (!${strings.camelize(type.typeName)}.${field.name}Id) {
      return null;
    }
    try {
      return await this.${field.name}Service.${field.name}GetById(${strings.camelize(type.typeName)}.${field.name}Id);
    } catch (err) {
      return null;
    }
  }`;
    }
  });
  return resolvedFields;
}
