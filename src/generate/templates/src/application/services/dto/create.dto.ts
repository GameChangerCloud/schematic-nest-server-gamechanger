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
  const enums = type.fields.filter(field => field.isEnum && !field.isDeprecated);
  const relationships = type.fields.filter(field => field.relation && !field.isDeprecated && !field.isEnum);
  enums.forEach((enumField) => {
    const enumTemplate = `\nimport { ${enumField.type} } from 'adapters/typeorm/entities/${strings.camelize(enumField.type)}.enum';`;
    importTemplate += enumTemplate;
  })
  relationships.forEach((relationship) => {
    const relationshipTemplate = `\nimport { ${relationship.type} } from 'adapters/typeorm/entities/${strings.camelize(relationship.type)}.model';`;
    importTemplate += relationshipTemplate;
  })

  return importTemplate;
}

function computeScalarsTemplate(type: Type): string {
  let importTemplate = ``;
  const scalars = type.fields.filter(field => !field.relation && !field.isDeprecated && field.type != "ID");
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
  ${scalar.name}${noNullCharacter}: ${strings.camelize(scalarTypeGQL)}${arrayCharacter}

`;
    importTemplate += scalarTemplate;
  });

  return importTemplate;
}

function computeRelationshipsTemplate(type: Type): string {
  let relationshipsAndEnumsTemplate = ``;
  const enums = type.fields.filter(field => field.isEnum && !field.isDeprecated);
  const relationships = type.fields.filter(field => field.relation && !field.isDeprecated && !field.isEnum);
  enums.forEach((enumField) => {
    let enumsTemplate;
    if (enumField.isArray) {
      enumsTemplate = `  @Field(() => [${enumField.type}])
  ${enumField.name}: ${enumField.type}[];
        
`;
    } else {
      enumsTemplate = `  @Field(() => ${enumField.type})
  ${enumField.name}: ${enumField.type};
          
`;
    }
    relationshipsAndEnumsTemplate += enumsTemplate;
  });
    
  relationships.forEach((relationship) => {
    let relationshipsTemplate;
    if (relationship.isArray) {
      relationshipsTemplate = `  @Field(() => [String], { nullable: true })
  ${strings.camelize(relationship.type)}Ids?: ${relationship.type}['id'][] | null;
        
`;
  } else {
    relationshipsTemplate = `  @Field(() => String, { nullable: true })
  ${strings.camelize(relationship.type)}Id?: ${relationship.type}['id'] | null;
        
`;
  }
  relationshipsAndEnumsTemplate += relationshipsTemplate;
  });

  return relationshipsAndEnumsTemplate;
}