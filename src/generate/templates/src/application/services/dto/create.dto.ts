import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    const importTemplate = computeImportsTemplate(type);
    const stdScalarsTemplate = computeScalarsTemplate(type);
    const stdRelationshipsTemplate = computeRelationshipsTemplate(type);

    let fileTemplate = `import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';${importTemplate}

@InputType()
export class ${type.typeName}CreateInput {
${stdScalarsTemplate}${stdRelationshipsTemplate}}

@ObjectType()
export class ${type.typeName}CreateOutput {
@Field(() => ${type.typeName})
${strings.camelize(type.typeName)}: ${type.typeName};
}
    `;

    // Create Service file
    _tree.create(
      `${projectName}/src/application/services/dto/${strings.camelize(
        type.typeName
      )}/${strings.camelize(
        type.typeName
      )}-create.dto.ts`,
      fileTemplate
    );
}

function computeImportsTemplate(type: Type): string {
  let importTemplate = ``;
  const relationships = type.fields.filter(field => field.relation === true && !field.isDeprecated);
  relationships.forEach((relationship) => {
    const scalarTemplate = `\nimport { ${relationship.type} } from 'adapters/typeorm/entities/${relationship.type.toLowerCase()}.model';`;
    importTemplate += scalarTemplate;
  })

  return importTemplate;
}

function computeScalarsTemplate(type: Type): string {
  let importTemplate = ``;
  const scalars = type.fields.filter(field => field.relation === false && !field.isDeprecated && field.type != "ID");
  scalars.forEach((scalar) => {
    const arrayCharacter = scalar.isArray ? "[]" : "";
    const noNullOption = scalar.noNull ? "" : ", { nullable: true }";
    const noNullCharacter = scalar.noNull ? "" : "?";
    let scalarTypeGQL: string;
    switch(scalar.type) {
      case "String" :
        scalarTypeGQL = "String";
        break;
      case "Float" :
      case "Int" :
        scalarTypeGQL = "Number";
        break;
      case "Boolean" :
        scalarTypeGQL = "Boolean";
        break;
      default:
        scalarTypeGQL = "Other"
    }

const scalarTemplate = `  @Field(() => ${scalarTypeGQL}${noNullOption})
  ${scalar.name}${noNullCharacter} : ${scalar.type.toLowerCase()}${arrayCharacter}

`;
    importTemplate += scalarTemplate;
  });

  return importTemplate;
}

function computeRelationshipsTemplate(type: Type): string {
  let importTemplate = ``;
  const relationships = type.fields.filter(field => field.relation === true && !field.isDeprecated);
  relationships.forEach((relationship) => {
  let scalarTemplate;
  if (relationship.isArray) {
    scalarTemplate = `
    @Field(() => [String], { nullable: true })
    ${relationship.type.toLowerCase()}Ids?: ${relationship.type}['id'][] | null;
        
    `;
  } else {
    scalarTemplate = `  @Field(() => String, { nullable: true })
  ${relationship.type.toLowerCase()}Id?: ${relationship.type}['id'] | null;
        
`;
  }
  importTemplate += scalarTemplate;
  });

  return importTemplate;
}