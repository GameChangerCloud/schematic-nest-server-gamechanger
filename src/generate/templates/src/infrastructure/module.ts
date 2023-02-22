import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';

export function createModule(
  types: Type[],
  type: Type,
  _tree: Tree,
  projectName: string
) {
    let [forwardRefImport, 
        entitiesImport, 
        fieldResolverImport,
        entitiesModulesImport,
        typeOmrRelatedEntities,
        forwardReferencedModules,
        referencedModules,
        fieldsResolver] = computeRelationalTemplates(types, type);
    let fileTemplate = `import { ${forwardRefImport}Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';${entitiesImport}
import { ${type.typeName}Service } from 'application/services/${strings.camelize(type.typeName)}.service';${fieldResolverImport}
import { ${type.typeName}MutationsResolver } from 'infrastructure/resolvers/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}.mutations.resolver';
import { ${type.typeName}QueriesResolver } from 'infrastructure/resolvers/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}.queries.resolver';${entitiesModulesImport}

@Module({
  imports: [
    TypeOrmModule.forFeature([${type.typeName}${typeOmrRelatedEntities}]),${forwardReferencedModules}${referencedModules}
  ],
  providers: [
    ${type.typeName}Service,
    ${type.typeName}MutationsResolver,
    ${type.typeName}QueriesResolver,${fieldsResolver}
  ],
  exports: [${type.typeName}Service],
})
export class ${type.typeName}Module {}
`;

  _tree.create(
    `${projectName}/src/infrastructure/modules/${strings.camelize(
      type.typeName
    )}.module.ts`,
    fileTemplate
  );
}

function computeRelationalTemplates(types: Type[], type: Type): string[] {
  const relationalFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated);
  let [forwardRefImport, forwardReferencedModules, referencedModules] = computeForwardReferences(types, type, relationalFields);
  let entitiesImport = computeManyOnlyRelationships(types, type, relationalFields)[2];
  let fieldResolverImport = '';
  let entitiesModulesImport = '';
  let typeOmrRelatedEntities = '';
  let fieldsResolver = '';
  if(relationalFields.length > 0) {
    fieldResolverImport = `
import { ${type.typeName}FieldsResolver } from 'infrastructure/resolvers/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}.fields.resolver';`;
    fieldsResolver = `
    ${type.typeName}FieldsResolver,`;
    relationalFields
      .filter((field) => field.type !== type.typeName)
      .forEach((relationalField) => {
        entitiesImport += `
import { ${relationalField.type} } from 'adapters/typeorm/entities/${strings.camelize(relationalField.type)}.model';`;
        entitiesModulesImport +=`
import { ${relationalField.type}Module } from './${strings.camelize(relationalField.type)}.module';`;
        typeOmrRelatedEntities +=`, ${relationalField.type}`;
      });
  }
  return [forwardRefImport, 
    entitiesImport, 
    fieldResolverImport,
    entitiesModulesImport,
    typeOmrRelatedEntities,
    forwardReferencedModules,
    referencedModules,
    fieldsResolver];
}

function computeForwardReferences(types: Type[], type: Type, relationalFields: Field[]): string[] {
  let forwardReferenceImport = '';
  let importForwardRef = false;
  let forwardReferencedModules = '';
  let referencedModules = '';
  relationalFields.forEach((relationalField) => {
    if (relationalField.type !== type.typeName) {
      let relation = type.relationList.find((relation) => relation.type === relationalField.type);
      if (relation.relatedFieldName) {
        importForwardRef = true;
        
        forwardReferencedModules += `
    forwardRef(() => ${relationalField.type}Module),`;
      } else if (relationalField.relationType !=='manyOnly'){
        referencedModules += `
    ${relationalField.type}Module,`;
      }
    }
  });
  if (importForwardRef || computeManyOnlyRelationships(types, type, relationalFields)[0]) forwardReferenceImport = 'forwardRef, ';
  forwardReferencedModules += computeManyOnlyRelationships(types, type, relationalFields)[1];
  return [forwardReferenceImport, forwardReferencedModules, referencedModules];
}

function computeManyOnlyRelationships(types: Type[], manyOnlyType: Type, relationalFields: Field[]): [boolean, string, string] {
  let importForwardRef = false;
  let forwardReferencedModules = ``;
  let importForwardEntities = ``;
  types.forEach((type) => {
    const fieldInRelatedType = type.fields.find((field) => field.type === manyOnlyType.typeName)
    if (fieldInRelatedType && fieldInRelatedType.relationType === 'manyOnly') {
      importForwardRef = true;
      forwardReferencedModules += `\n    forwardRef(() => ${type.typeName}Module),`;
      importForwardEntities = `\nimport { ${type.typeName}Module } from './${strings.camelize(type.typeName)}.module';`;
    }
  });
  const manyOnlyFields = relationalFields.filter(field => field.relationType === 'manyOnly');
  if (manyOnlyFields.length > 0) {
    importForwardRef = true;
    manyOnlyFields.forEach((manyOnlyField) => {
      forwardReferencedModules += `\n    forwardRef(() => ${manyOnlyField.type}Module),`;
    });
  }
  return [importForwardRef, forwardReferencedModules, importForwardEntities];
}