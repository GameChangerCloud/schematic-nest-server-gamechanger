"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDto = void 0;
const core_1 = require("@angular-devkit/core");
function createDto(type, _tree, projectName) {
    const importTemplate = computeImportsTemplate(type);
    const stdScalarsTemplate = computeScalarsTemplate(type);
    const stdRelationshipsTemplate = computeRelationshipsTemplate(type);
    let fileTemplate = `import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { ${type.typeName} } from 'adapters/typeorm/entities/${core_1.strings.camelize(type.typeName)}.model';${importTemplate}

@InputType()
export class ${type.typeName}CreateInput {
${stdScalarsTemplate}${stdRelationshipsTemplate}}

@ObjectType()
export class ${type.typeName}CreateOutput {
@Field(() => ${type.typeName})
${core_1.strings.camelize(type.typeName)}: ${type.typeName};
}
    `;
    // Create Service file
    _tree.create(`${projectName}/src/application/services/dto/${core_1.strings.camelize(type.typeName)}/${core_1.strings.camelize(type.typeName)}-create.dto.ts`, fileTemplate);
}
exports.createDto = createDto;
function computeImportsTemplate(type) {
    let importTemplate = ``;
    const relationships = type.fields.filter(field => field.relation === true && !field.isDeprecated);
    relationships.forEach((relationship) => {
        const scalarTemplate = `\nimport { ${relationship.type} } from 'adapters/typeorm/entities/${relationship.type.toLowerCase()}.model';`;
        importTemplate += scalarTemplate;
    });
    return importTemplate;
}
function computeScalarsTemplate(type) {
    let importTemplate = ``;
    const scalars = type.fields.filter(field => field.relation === false && !field.isDeprecated && field.type != "ID");
    scalars.forEach((scalar) => {
        const arrayCharacter = scalar.isArray ? "[]" : "";
        const noNullOption = scalar.noNull ? "" : ", { nullable: true }";
        const noNullCharacter = scalar.noNull ? "" : "?";
        let scalarTypeGQL;
        switch (scalar.type) {
            case "String":
                scalarTypeGQL = "String";
                break;
            case "Float":
            case "Int":
                scalarTypeGQL = "Number";
                break;
            case "Boolean":
                scalarTypeGQL = "Boolean";
                break;
            default:
                scalarTypeGQL = "Other";
        }
        const scalarTemplate = `  @Field(() => ${scalarTypeGQL}${noNullOption})
  ${scalar.name}${noNullCharacter} : ${scalar.type.toLowerCase()}${arrayCharacter}

`;
        importTemplate += scalarTemplate;
    });
    return importTemplate;
}
function computeRelationshipsTemplate(type) {
    let importTemplate = ``;
    const relationships = type.fields.filter(field => field.relation === true && !field.isDeprecated);
    relationships.forEach((relationship) => {
        let scalarTemplate;
        if (relationship.isArray) {
            scalarTemplate = `
    @Field(() => [String], { nullable: true })
    ${relationship.type.toLowerCase()}Ids?: ${relationship.type}['id'][] | null;
        
    `;
        }
        else {
            scalarTemplate = `  @Field(() => String, { nullable: true })
  ${relationship.type.toLowerCase()}Id?: ${relationship.type}['id'] | null;
        
`;
        }
        importTemplate += scalarTemplate;
    });
    return importTemplate;
}
//# sourceMappingURL=create.dto.js.map