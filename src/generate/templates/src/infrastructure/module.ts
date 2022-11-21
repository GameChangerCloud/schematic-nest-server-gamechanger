import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';

export function createModule(
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
        fieldsResolver] = computeRelationalTemplates(type);
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
    // Create Service file
    _tree.create(
      `${projectName}/src/infrastructure/modules/${strings.camelize(
        type.typeName
      )}.module.ts`,
      fileTemplate
    );
}

function computeRelationalTemplates(type: Type): string[] {
    const relationalFields = type.fields.filter((field) => field.relation && field.relationType !== "selfJoinOne" && field.relationType !== "selfJoinMany" && !field.isEnum && !field.isDeprecated);
    let [forwardRefImport, forwardReferencedModules, referencedModules] = computeForwardReferences(type, relationalFields);
    let entitiesImport = "";
    let fieldResolverImport = "";
    let entitiesModulesImport = "";
    let typeOmrRelatedEntities = "";
    let fieldsResolver = "";
    if(relationalFields.length > 0) {
        fieldResolverImport = `
import { ${type.typeName}FieldsResolver } from 'infrastructure/resolvers/${strings.camelize(type.typeName)}/${strings.camelize(type.typeName)}.fields.resolver';`;
        fieldsResolver = `
    ${type.typeName}FieldsResolver,`;
        relationalFields.forEach((relationalField) => {
            // Si ref dans les types associés, initialiser forwardRefImport forwardRefModu & refMod
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

function computeForwardReferences(type: Type, relationalFields: Field[]): string[] {
  let forwardReferenceImport = '';
  let forwardReferencedModules = '';
  let referencedModules = '';
  relationalFields.forEach((relationalField) => {
    if (relationalField.type !== type.typeName) {
      let relation = type.relationList.find((relation) => relation.type === relationalField.type);
      if (relation.relatedFieldName) {
        forwardReferenceImport = 'forwardRef, ';
        forwardReferencedModules += `
    forwardRef(() => ${relationalField.type}Module),`;
      } else {
        referencedModules += `
    ${relationalField.type}Module,`;
      }
    }
  })
  return [forwardReferenceImport, forwardReferencedModules, referencedModules];
}