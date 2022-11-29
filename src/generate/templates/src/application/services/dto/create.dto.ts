import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';
const pluralize = require("pluralize");

export function createCreateDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    const importTemplate = computeImportsTemplate(type);
    const [stdScalarsTemplate, validatorsImportTemplate] = computeScalarsTemplate(type);
    const stdRelationshipsTemplate = computeRelationshipsTemplate(type);

    let fileTemplate = `import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';${importTemplate}${validatorsImportTemplate}

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
    if (relationship.type !== type.typeName) {
      const relationshipTemplate = `\nimport { ${relationship.type} } from 'adapters/typeorm/entities/${strings.camelize(relationship.type)}.model';`;
      importTemplate += relationshipTemplate;
    }
  })

  return importTemplate;
}

function computeScalarsTemplate(type: Type): string[] {
  let stdScalarsTemplate = ``;
  let validatorsToImportList: string[] = [];
  const scalars = type.fields.filter(field => !field.relation && !field.isDeprecated && field.type != "ID");
  scalars.forEach((scalar) => {
    let fieldDirective = '';
    if (scalar.directives.length > 0) {
      let lengthDirective = scalar.directives.find((dir: { name: string, args : { name: string, value: "value"}[] }) => dir.name === 'length');
      if (lengthDirective) {

      }
    }
    const arrayCharacter = scalar.isArray ? "[]" : "";
    const noNullOption = scalar.noNull ? "" : ", { nullable: true }";
    const noNullCharacter = scalar.noNull ? "" : "?";
    let scalarTypeGQL: string;
    switch(scalar.type) {
      case "String" :
        scalarTypeGQL = "String";
        [fieldDirective, validatorsToImportList] = computeFieldDirective(scalar, scalar.type, validatorsToImportList);
        break;
      case "Float" :
      case "Int" :
        scalarTypeGQL = "Number";
        [fieldDirective, validatorsToImportList] = computeFieldDirective(scalar, scalar.type, validatorsToImportList);
        break;
      case "Boolean" :
        scalarTypeGQL = "Boolean";
        break;
      default:
        scalarTypeGQL = "Other"
    }

    const scalarTemplate = `  ${fieldDirective}@Field(() => ${scalarTypeGQL}${noNullOption})
  ${scalar.name}${noNullCharacter}: ${strings.camelize(scalarTypeGQL)}${arrayCharacter};\n\n`;
    stdScalarsTemplate += scalarTemplate;
  });

  let validatorsToImportString = "";
  let validatorsImportTemplate = "";
  if (validatorsToImportList.length > 0) {
    for (let i = 0; i < validatorsToImportList.length; i++) {
      if (i === validatorsToImportList.length - 1) validatorsToImportString += `${validatorsToImportList[i]}`;
      else validatorsToImportString += `${validatorsToImportList[i]}, `;
    }
    validatorsImportTemplate = `\nimport { ${validatorsToImportString} } from 'class-validator';`;
  }
  

  return [stdScalarsTemplate, validatorsImportTemplate];
}

function computeRelationshipsTemplate(type: Type): string {
  let relationshipsAndEnumsTemplate = ``;
  const enums = type.fields.filter(field => field.isEnum && !field.isDeprecated);
  const relationships = type.fields.filter(field => field.relation && !field.isDeprecated && !field.isEnum);
  enums.forEach((enumField) => {
    let enumsTemplate;
    if (enumField.isArray) {
      enumsTemplate = `  @Field(() => [${enumField.type}])
  ${enumField.name}: ${enumField.type}[];\n\n`;
    } else {
      enumsTemplate = `  @Field(() => ${enumField.type})
  ${enumField.name}: ${enumField.type};\n\n`;
    }
    relationshipsAndEnumsTemplate += enumsTemplate;
  });
    
  relationships.forEach((relationship) => {
    let relationshipsTemplate;
    if (relationship.isArray) {
      relationshipsTemplate = `  @Field(() => [String], { nullable: true })
  ${strings.camelize(pluralize(relationship.name, 1))}Ids?: ${relationship.type}['id'][] | null;\n\n`;
  } else {
    relationshipsTemplate = `  @Field(() => String, { nullable: true })
  ${strings.camelize(relationship.name)}Id?: ${relationship.type}['id'] | null;\n\n`;
  }
  relationshipsAndEnumsTemplate += relationshipsTemplate;
  });

  return relationshipsAndEnumsTemplate;
}

function computeFieldDirective(scalar: Field, scalarType: string, validatorsToImport: string[]): [string, string[]] {
  let directiveTemplate = '';
  if (scalarType === "String") {
    const lengthDirective = scalar.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === "length");
    if (lengthDirective) {
      let minLength = lengthDirective.args.find((arg: { name: string, value: string }) => arg.name === "min");
      let maxLength = lengthDirective.args.find((arg: { name: string, value: string }) => arg.name === "max");
      if (minLength && maxLength) {
        directiveTemplate = `@Length(${minLength.value}, ${maxLength.value})\n  `;
        if (!validatorsToImport.includes('Length')) validatorsToImport.push('Length');
      } else if (minLength && !maxLength) {
        directiveTemplate = `@MinLength(${minLength.value})\n  `;
        if (!validatorsToImport.includes('MinLength')) validatorsToImport.push('MinLength');
      } else if (!minLength && maxLength) {
        directiveTemplate = `@MaxLength(${maxLength.value})\n  `;
        if (!validatorsToImport.includes('MaxLength')) validatorsToImport.push('MaxLength');
      }
    }
  }

  if (scalarType === "Int") {
    const rangeDirective = scalar.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === "length");
    if (rangeDirective) {
      let minValue = rangeDirective.args.find((arg: { name: string, value: string }) => arg.name === "min");
      let maxValue = rangeDirective.args.find((arg: { name: string, value: string }) => arg.name === "max");
      if (minValue) {
        directiveTemplate += `@Min(${minValue.value})\n  `;
        if (!validatorsToImport.includes('Min')) validatorsToImport.push('Min');
      } 
      if (maxValue) {
        directiveTemplate += `@Max(${maxValue.value})\n  `;
        if (!validatorsToImport.includes('Max')) validatorsToImport.push('Max');
      }
    }
  }
  return [directiveTemplate, validatorsToImport]
}