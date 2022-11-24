"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const easygraphql_parser_gamechanger_1 = require("easygraphql-parser-gamechanger");
const query_resolver_1 = require("./templates/query.resolver");
const create_dto_1 = require("./templates/src/application/services/dto/create.dto");
const delete_dto_1 = require("./templates/src/application/services/dto/delete.dto");
const entity_pagination_dto_1 = require("./templates/src/application/services/dto/entity.pagination.dto");
const getOne_dto_1 = require("./templates/src/application/services/dto/getOne.dto");
//import { paginationDto } from './templates/src/application/services/dto/pagination.dto';
const update_dto_1 = require("./templates/src/application/services/dto/update.dto");
const service_interface_1 = require("./templates/src/domain/service.interface");
const entities_model_1 = require("./templates/src/adapters/typeorm/entities/entities.model");
const enum_model_1 = require("./templates/src/adapters/typeorm/entities/enum.model");
const fs = require('fs');
const path = require('path');
/**
 * MAIN RULE OF THIS SCHEMATIC
 * Generate  new angular-client-gamechanger in root dir
 * @param _options Options from schematics schema
 * @returns <custom-gamechanger-angular-client>
 */
function generate(_options) {
    return (_tree, _context) => {
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
        let types = initTypes(_options.gqlFileName);
        /**
         * NEST SERVER GENERATION
         */
        //const rules: Rule[] = [];
        types.forEach((type) => {
            if (type.type !== 'EnumTypeDefinition') {
                (0, query_resolver_1.createResolverQuery)(type, _tree, _options.name);
                (0, service_interface_1.createServiceInterface)(type, _tree, _options.name);
                (0, create_dto_1.createDto)(type, _tree, _options.name);
                (0, delete_dto_1.deleteDto)(type, _tree, _options.name);
                (0, getOne_dto_1.getOneDto)(type, _tree, _options.name);
                (0, update_dto_1.updateDto)(type, _tree, _options.name);
                (0, entity_pagination_dto_1.paginationEntityDto)(type, _tree, _options.name);
                (0, entities_model_1.createTypeOrmEntitieFile)(type, _tree, _options.name);
                //paginationDto(_tree, _options.name);
            }
            else {
                (0, enum_model_1.createTypeOrmEnumFile)(type, _tree, _options.name);
            }
            //rules.push(createService(type, strings, _options, types));
            // rules.push(createModule(type, strings, _options, types));
        });
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./app'), [
            (0, schematics_1.template)(Object.assign(Object.assign(Object.assign({}, core_1.strings), _options), { types })),
            (0, schematics_1.move)(`${_options.name}/`),
        ]);
        console.log('App generated');
        return (0, schematics_1.chain)([(0, schematics_1.mergeWith)(templateSource)]);
    };
}
exports.generate = generate;
/**
 * Parse graphQL schema with easygraphqlparser from gamechanger-parser
 * Find types structure from gamechanger-parser there:
 * https://github.com/GameChangerCloud/easygraphql-parser-gamechanger
 * OR https://www.notion.so/GameChanger-df7d7d25885144e9a4f185a272f91e7a
 * TODO : Use filename path
 * TODO : Return schema error | Return error if file not found
 * @returns types
 */
function initTypes(gcpFileName) {
    gcpFileName;
    const schemaCode = fs.readFileSync(path.join(__dirname, '../../graphql-schemas', `astronauts.graphql`), 'utf8');
    // 1 - Basic Parsing of the schema
    // let types = schemaParser(schemaCode)
    // 2 - Enriched parsing
    let types = (0, easygraphql_parser_gamechanger_1.typesGenerator)((0, easygraphql_parser_gamechanger_1.schemaParser)(schemaCode));
    // 3 - Add relation & directivity info in the types
    types = (0, easygraphql_parser_gamechanger_1.getRelations)(types);
    return types;
}
//# sourceMappingURL=index.js.map