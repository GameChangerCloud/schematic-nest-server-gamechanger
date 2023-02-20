const pluralize = require('pluralize');
import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';

export function createFieldsResolver(
  types: Type[],
  type: Type,
  _tree: Tree,
  projectName: string
) {
    const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.relationType);
    let arrayFields = relatedFields.filter(field => field.isArray);
    let argsImport = arrayFields.length > 0 ? 'Args, ' : '';
    let fileTemplate = `import { ${argsImport}Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.decamelize(type.typeName)}.model';${generateImports(type, relatedFields)}${computeManyOnlyRelationship(types, type)[0]}

@Resolver(${type.typeName})
export class ${type.typeName}FieldsResolver {
  constructor(${generateConstructor(type, relatedFields)}${computeManyOnlyRelationship(types, type)[1]}
  ) {}${generateResolveFields(type, relatedFields)}${computeManyOnlyRelationship(types, type)[2]}
}
`;


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
        importsTemplate += `\nimport { ${type.typeName}${strings.capitalize(field.name)}Pagination } from 'application/services/dto/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}-${strings.camelize(field.name)}-pagination.dto';`;
      } else {
        if (field.type !== type.typeName) importsTemplate += `\nimport { ${field.type} } from 'adapters/typeorm/entities/${strings.camelize(field.type)}.model';`
        importsTemplate += `\nimport { ${field.type}Service } from 'application/services/${strings.camelize(field.type)}.service';`;
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
      return await this.${strings.camelize(field.type)}Service.${strings.camelize(field.type)}GetById(${strings.camelize(type.typeName)}.${field.name}Id);
    } catch (err) {
      return null;
    }
  }`;
    }
  });
  return resolvedFields;
}

function computeManyOnlyRelationship(types: Type[], manyOnlyType: Type): string[] {
  let importEntitiesAndServicesTemplate = ``;
  let injectServicestemplate = ``;
  let resolveFieldsTemplate = ``;
  types.forEach((type: Type) => {
    const fieldInRelatedType = type.fields.find((field) => field.type === manyOnlyType.typeName)
    if (fieldInRelatedType && fieldInRelatedType.relationType === 'manyOnly') {
      importEntitiesAndServicesTemplate += `\nimport { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import { ${type.typeName}Service } from 'application/services/${strings.camelize(type.typeName)}.service';`;
      injectServicestemplate += `\n    private ${strings.camelize(type.typeName)}Service: ${type.typeName}Service,`;
      resolveFieldsTemplate += `\n  @ResolveField(() => ${type.typeName}, { nullable: true })
  async ${strings.camelize(type.typeName)}(@Parent() ${pluralize(fieldInRelatedType.name, 1)}: ${fieldInRelatedType.type}) {
    if (!${pluralize(fieldInRelatedType.name, 1)}.${strings.camelize(type.typeName)}Id) {
      return null;
    }
    try {
      return await this.${strings.camelize(type.typeName)}Service.${strings.camelize(type.typeName)}GetById(${pluralize(fieldInRelatedType.name, 1)}.${strings.camelize(type.typeName)}Id);
    } catch (err) {
      return null;
    }
  }\n`;
    }
  });
  return [importEntitiesAndServicesTemplate, injectServicestemplate, resolveFieldsTemplate];
}
