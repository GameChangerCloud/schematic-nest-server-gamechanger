import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  schemaParser,
  getRelations,
  typesGenerator,
} from 'easygraphql-parser-gamechanger';
import { createResolverQuery } from './templates/query.resolver';
import { createCreateDto } from './templates/src/application/services/dto/create.dto';
import { createDeleteDto } from './templates/src/application/services/dto/delete.dto';
import { createEntityPaginationDto } from './templates/src/application/services/dto/entity.pagination.dto';
import { createFieldPaginationDto } from './templates/src/application/services/dto/field.pagination.dto';
import { createGetOneDto } from './templates/src/application/services/dto/getOne.dto';
import { createUpdateDto } from './templates/src/application/services/dto/update.dto';
import { createService } from './templates/src/application/services/service';
import { createServiceInterface } from './templates/src/domain/service.interface';
import { createModule } from './templates/src/infrastructure/module';
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

    // TODO : SET SCHEMA.JSON TO GET REQUIRED INFOS FOR THE GENERATION
    // TODO : IMPLEMENT REQUIRED INFO CHECKING(Function ? checking directly there ?) 


    /**
     * INIT GAMECHANGER TYPES
     */

    let types = initTypes(_options.gqlFileName);

    console.log('Types generated :',types);
    
    /**
     * NEST SERVER GENERATION
     */

    //const rules: Rule[] = [];

    types.forEach((type) => {
      if (type.type !== 'EnumTypeDefinition') {
        createModule(type, _tree, _options.name);
        createResolverQuery(type, _tree, _options.name);
        createServiceInterface(type, _tree, _options.name);
        createCreateDto(type, _tree, _options.name);
        createDeleteDto(type, _tree, _options.name);
        createGetOneDto(type, _tree, _options.name);
        createUpdateDto(type, _tree, _options.name);
        createEntityPaginationDto(type, _tree, _options.name);
        const relatedFields = type.fields.filter((field) => field.relation && !field.isEnum && !field.isDeprecated && field.isArray && field.relationType)
        if (relatedFields.length > 0) {
          relatedFields.forEach((relatedField) => {
            createFieldPaginationDto(type, relatedField, _tree, _options.name);
          });
        }
        createService(type, _tree, _options.name);
      }
      
      //rules.push(createService(type, strings, _options, types));
      
    // rules.push(createModule(type, strings, _options, types));
    })

    const templateSource = apply(url('./app'), [
      template({
        ...strings,
        ..._options,
        types,
      }),
      move(`${_options.name}/` as string),
    ]);

    console.log('App generated');

    // console.log('+++++/' + rules);
    // console.log('+++++-' + chain(rules));
    return chain([mergeWith(templateSource)]);
  };
}

/**
 * Parse graphQL schema with easygraphqlparser from gamechanger-parser
 * Find types structure from gamechanger-parser there:
 * https://github.com/GameChangerCloud/easygraphql-parser-gamechanger
 * OR https://www.notion.so/GameChanger-df7d7d25885144e9a4f185a272f91e7a
 * TODO : Use filename path
 * TODO : Return schema error | Return error if file not found
 * @returns types
 */
 function initTypes(gcpFileName: string) {
  gcpFileName;

  const schemaCode = fs.readFileSync(
    path.join(__dirname, '../../graphql-schemas', `astronauts.graphql`),
    'utf8'
  );

  // 1 - Basic Parsing of the schema
  // let types = schemaParser(schemaCode)
  // 2 - Enriched parsing
  let types = typesGenerator(schemaParser(schemaCode));
  // 3 - Add relation & directivity info in the types
  types = getRelations(types);
  
  return types;
}


