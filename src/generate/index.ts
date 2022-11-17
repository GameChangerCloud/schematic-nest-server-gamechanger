import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  schemaParser,
  getRelations,
  typesGenerator,
} from 'easygraphql-parser-gamechanger';
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

    const templateSource = apply(url('./app'), [
      template({
        ...strings,
        ..._options,
        types,
      }),
      move(`test-schematic-nest-js/` as string),
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


