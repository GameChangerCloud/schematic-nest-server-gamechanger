import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  schemaParser,
  getRelations,
  typesGenerator,
  Type,
} from 'easygraphql-parser-gamechanger';
import { createResolverQuery } from './templates/query.resolver';
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

    const rules: Rule[] = [];

    types.forEach((type) => {
      createService(type, strings, _options, types);
      createResolverQuery(type, _tree, _options.name);
      rules.push(createService(type, strings, _options, types));
      
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

    console.log('+++++/' + rules);
    console.log('+++++-' + chain(rules));
    return chain([mergeWith(templateSource)]);
  };
}

function createService(type: Type, strings: any, _options: any, types: Type[]) {
 
  const templateSource = apply(url('./app/TestBis/hello'), [
    template({
      type,
      ...strings,
      ..._options,
      types,
    }),
    move(`${_options.name}/` as string),
  ]);

  return mergeWith(templateSource);
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
    path.join(__dirname, '../../graphql-schemas', `employe-schema.graphql`),
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


