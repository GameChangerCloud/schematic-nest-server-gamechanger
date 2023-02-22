import { strings } from '@angular-devkit/core';
import {
  apply, chain, mergeWith, move, Rule, SchematicContext,
  // SchematicsException, 
  template, Tree, url
} from '@angular-devkit/schematics';
import {
  schemaParser,
  getRelations,
  typesGenerator,
  Type,
} from 'easygraphql-parser-gamechanger';

import { createCreateDto } from './templates/src/application/services/dto/create.dto';
import { createDeleteDto } from './templates/src/application/services/dto/delete.dto';
import { createEntityPaginationDto } from './templates/src/application/services/dto/entity.pagination.dto';
import { createFieldPaginationDto } from './templates/src/application/services/dto/field.pagination.dto';
import { createGetOneDto } from './templates/src/application/services/dto/getOne.dto';
import { createUpdateDto } from './templates/src/application/services/dto/update.dto';
import { createService } from './templates/src/application/services/service';
import { createModule } from './templates/src/infrastructure/module';
import { createServiceInterface } from './templates/src/domain/service.interface';
import { createTypeOrmEntityFile } from './templates/src/adapters/typeorm/entities/entities.model';
import { createTypeOrmEnumFile } from './templates/src/adapters/typeorm/entities/enum.model';
import { createAppModule } from './templates/src/app.module';
import { createMutationsResolver } from './templates/src/infrastructure/resolvers/mutations.resolver';
import { createFieldsResolver } from './templates/src/infrastructure/resolvers/fields.resolver';
import { createQueriesResolver } from './templates/src/infrastructure/resolvers/queries.resolver';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';
import { createDatasource } from './templates/src/adapters/typeorm/datasource';
import { createNodeModel } from './templates/src/adapters/typeorm/entities/node.model';
import { createDomainModelInterfaceFile } from './templates/src/domain/model/entities.model.interface';
import { createDomainModelEnumFile } from './templates/src/domain/model/enum.model.interface';
import { createNodeModelInterface } from './templates/src/domain/model/node.model.interface';
import { createMain } from './templates/src/main';
import { createYogaDriver } from './templates/src/graphql-yoga-driver';
import { createCredentials } from './templates/src/credentials';
import { createPagination } from './templates/src/application/services/dto/pagination.dto';
import { createIndex } from './templates/src/index';
import { createTFVar } from './templates/terraform/terraform.tfvars';
const fs = require('fs');
const path = require('path');

/**
 * MAIN RULE OF THIS SCHEMATIC
 * Generate  new angular-client-gamechanger in root dir
 * @param _options Options from schematics schema
 * @returns <custom-gamechanger-angular-client>
 */
export function generate(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    /**
     * CHECK REQUIRED OPTIONS
     */

    // if (!_options.name) {
    //   throw new SchematicsException('Option (name) is required.');
    // }

    // if(!_options.gqlFilePath){
    //   throw new SchematicsException('GCL schema File path is required.');
    // }
    
    /**
     * INIT GAMECHANGER TYPES
     */

    let types = initTypes(_options['graphql-file']);


    /**
     * NEST SERVER GENERATION
     */

    //const rules: Rule[] = [];

    types.forEach((type) => {
      if (type.type === 'ObjectTypeDefinition' && type.isNotOperation()) {
        createModule(types, type, _tree, _options.name);
        createServiceInterface(type, _tree, _options.name);
        createCreateDto(type, _tree, _options.name);
        createDeleteDto(type, _tree, _options.name);
        createGetOneDto(type, _tree, _options.name);
        createUpdateDto(types, type, _tree, _options.name);
        createEntityPaginationDto(type, _tree, _options.name);
        const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.relationType);
        if (relatedFields.length > 0) createFieldsResolver(types, type, _tree, _options.name);
        if (type.relationList.length == 0 
          && type.type === 'ObjectTypeDefinition'
          && computeManyOnlyRelationship(types, type)) createFieldsResolver(types, type, _tree, _options.name);
        
        const relatedFieldsArray = relatedFields.filter((field) => field.isArray);
        if (relatedFieldsArray.length > 0) {
          relatedFieldsArray.forEach((relatedField: Field) => {
            createFieldPaginationDto(type, relatedField, _tree, _options.name);
          });
        }
        createService(types, type, _tree, _options.name);
        createTypeOrmEntityFile(type, types, _tree, _options.name);
        createDomainModelInterfaceFile(types, type, _tree, _options.name);
        createMutationsResolver(type, _tree, _options.name);
        createQueriesResolver(type, _tree, _options.name);
      } else if (type.type === 'EnumTypeDefinition') {
        createTypeOrmEnumFile(type, _tree, _options.name);
        createDomainModelEnumFile(type, _tree, _options.name);

      }
    })

    createMain(_tree, _options.name);
    createIndex(_tree, _options.name);
    createYogaDriver(_tree, _options.name);
    createCredentials(_tree, _options.name);
    createAppModule(types, _tree, _options.name);
    createDatasource(_tree, _options.name);
    createNodeModel(types, _tree, _options.name);
    createPagination(_tree, _options.name);
    createNodeModelInterface(types, _tree, _options.name);
    createTFVar(_tree, _options.name, _options["graphql-file"]);


    const templateSource = apply(url('./app'), [
      template({
        ...strings,
        ..._options,
        types,
      }),
      move(`${_options.name}/` as string),
    ]);

    console.log('App generated');

    return chain([mergeWith(templateSource)]);
  };
}

/**
 * Parse graphQL schema with easygraphqlparser from gamechanger-parser
 * Find types structure from gamechanger-parser there:
 * https://github.com/GameChangerCloud/easygraphql-parser-gamechanger
 * OR https://www.notion.so/GameChanger-df7d7d25885144e9a4f185a272f91e7a
 * TODO : Return schema error | Return error if file not found
 * @returns types
 */
function initTypes(graphqlSchema: string) {
  const schemaCode = fs.readFileSync(
    path.join(__dirname, '../../../../', graphqlSchema),
    'utf8'
  );

  return getRelations(typesGenerator(schemaParser(schemaCode)));
}

/**
 * // Eligible types for field resolver generation through this function are 
  // those which do not have defined relationships otherwise the generation 
  // of the resolver would happen twice
 * @param types 
 * @param manyOnlyType 
 * @returns whether the processed type is concerned in a manyOnly Relationship
 */
function computeManyOnlyRelationship(types: Type[], manyOnlyType: Type) : boolean {
  let generateFieldsResolver = false;
  if (manyOnlyType.relationList.length == 0 && manyOnlyType.type === 'ObjectTypeDefinition')
  types.forEach((type: Type) => {
    const fieldInRelatedType = type.fields.find((field) => field.type === manyOnlyType.typeName)
    if (fieldInRelatedType && fieldInRelatedType.relationType === 'manyOnly') {
      generateFieldsResolver = true;
    }
  });
  return generateFieldsResolver;
}


