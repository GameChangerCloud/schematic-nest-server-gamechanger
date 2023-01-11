import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';
const pluralize = require('pluralize');

export function createUpdateDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    const importTemplate = computeImportsTemplate(type);
    const [stdScalarsTemplate, validatorsImportTemplate] = computeScalarsTemplate(type);
    const stdRelationshipsTemplate = computeRelationshipsTemplate(type);

    let fileTemplate = `import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';${importTemplate}${validatorsImportTemplate}

@InputType('${type.typeName}UpdateInput')
export class ${type.typeName}UpdateInput {
${stdScalarsTemplate}${stdRelationshipsTemplate}}

@ObjectType('${type.typeName}UpdateOutput')
export class ${type.typeName}UpdateOutput {
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
      )}-update.dto.ts`,
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
  if (type.fields.find((field: Field) => field.type === 'ID')) stdScalarsTemplate += ``;
  let validatorsToImportFromDirective: string[] = [];
  const scalars = type.fields.filter(field => !field.relation && !field.isDeprecated && field.type !== 'ID');
  scalars.forEach((scalar) => {
    let fieldDirective = '';
    const arrayCharacter = scalar.isArray ? '[]' : '';
    const noNullOption = scalar.noNull ? '' : ', { nullable: true }';
    const noNullCharacter = scalar.noNull ? '' : '?';
    let scalarTypeGQL: string;
    [fieldDirective, validatorsToImportFromDirective] = computeFieldDirective(scalar, scalar.type, validatorsToImportFromDirective);
    switch(scalar.type) {
      case 'String' :
        scalarTypeGQL = 'String';
        break;
      case 'Float' :
      case 'Int' :
        scalarTypeGQL = 'Number';
        break;
      case 'Boolean' :
        scalarTypeGQL = 'Boolean';
        break;
      default:
        scalarTypeGQL = 'String';
    }
    if (scalar.type.includes('Int')) scalarTypeGQL = 'Number';

    const scalarTemplate = `  ${fieldDirective}@Field(() => ${scalarTypeGQL}${noNullOption})
  ${scalar.name}${noNullCharacter}: ${strings.camelize(scalarTypeGQL)}${arrayCharacter};\n\n`;
    stdScalarsTemplate += scalarTemplate;
  });

  let validatorsImportTemplate = '';
  let typeValidatorsToImport = classValidatorsImport(type);
  if (validatorsToImportFromDirective.length > 0 || typeValidatorsToImport.length > 0) {
    let totalValidators = validatorsToImportFromDirective.concat(typeValidatorsToImport);
    validatorsImportTemplate = `\nimport { ${totalValidators.join(', ')} } from 'class-validator';`;
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
  let directiveTemplate = getTypeValidators(scalar);
  console.log()
  if (scalarType === 'String') {
    const lengthDirective = scalar.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === 'length');
    if (lengthDirective) {
      let minLength = lengthDirective.args.find((arg: { name: string, value: string }) => arg.name === 'min');
      let maxLength = lengthDirective.args.find((arg: { name: string, value: string }) => arg.name === 'max');
      if (minLength && maxLength) {
        directiveTemplate += `@Length(${minLength.value}, ${maxLength.value})\n  `;
        if (!validatorsToImport.includes('Length')) validatorsToImport.push('Length');
      } else if (minLength && !maxLength) {
        directiveTemplate += `@MinLength(${minLength.value})\n  `;
        if (!validatorsToImport.includes('MinLength')) validatorsToImport.push('MinLength');
      } else if (!minLength && maxLength) {
        directiveTemplate += `@MaxLength(${maxLength.value})\n  `;
        if (!validatorsToImport.includes('MaxLength')) validatorsToImport.push('MaxLength');
      }
    }
  }

  if (scalarType === 'Int') {
    const rangeDirective = scalar.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === 'length');
    if (rangeDirective) {
      let minValue = rangeDirective.args.find((arg: { name: string, value: string }) => arg.name === 'min');
      let maxValue = rangeDirective.args.find((arg: { name: string, value: string }) => arg.name === 'max');
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

function classValidatorsImport(type: Type): string[] {
  let validators: string[] = [];
  let supportedValidators = ['String', 'HSL', 'Boolean', 'Currency', 'PhoneNumber', 'PostalCode', 'JSON', 'ISBN', 'Port', 'Date']

  type.fields
    .forEach((field: Field) => { 
      if (supportedValidators.includes(field.type) && !validators.includes(`Is${field.type}`)) validators.push(`Is${field.type}`);
      else if (field.type.includes('Positive') && !field.type.includes('Non') && !validators.includes(`IsPositive`)) validators.push(`IsPositive`);
      else if (field.type.includes('Negative') && !field.type.includes('Non') && !validators.includes(`IsNegative`)) validators.push(`IsNegative`);
      else if (field.type.includes('Int') && !validators.includes(`IsInt`)) validators.push(`IsInt`);
      else if (field.type.includes('IP') && !validators.includes(`IsIP`)) validators.push(`IsIP`);
      else if (field.type === 'RGB' || field.type === 'RGBA' &&!validators.includes(`IsRgbColor`)) validators.push(`IsRgbColor`);
      else if (field.type === 'HexColorCode' && !validators.includes(`IsHexColor`)) validators.push(`IsHexColor`);
      else if (field.type === 'EmailAddress' && !validators.includes(`IsEmail`)) validators.push(`IsEmail`);
      else if (field.type === 'MAC' && !validators.includes(`IsMACAddress`)) validators.push(`IsMACAddress`);
      else if (field.type === 'URL' && !validators.includes(`IsUrl`)) validators.push(`IsUrl`);
      else if (field.isEnum && !validators.includes(`IsEnum`))validators.push(`IsEnum`);
    });

  return validators;
}

function getTypeValidators(field: Field): string {
  let typeValidators = ``;
  if (field.type.includes('Positive') && !field.type.includes('Non')) typeValidators += '@IsPositive()\n  ';
  if (field.type.includes('Negative') && !field.type.includes('Non')) typeValidators += '@IsNegative()\n  ';

  if (field.type === 'EmailAddress') typeValidators += `@IsEmail()\n  `;
  else if (field.isEnum) typeValidators += `@IsEnum(entity: ${field.type})\n  `;
  else if (field.type.includes('IP')) typeValidators += `@IsIP(${field.type[3]})\n  `;
  else if (field.type === 'MAC') typeValidators += `@IsMACAddress()\n  `;
  else if (field.type === 'URL') typeValidators += `@IsUrl()\n  `;
  else if (field.type === 'HSL') typeValidators += `@IsHSL()\n  `;
  else if (field.type === 'RGB' || field.type === 'RGBA') typeValidators += `@IsRgbColor()\n  `;
  else if (field.type === 'Port') typeValidators += `@IsPort()\n  `;
  else if (field.type === 'ISBN') typeValidators += `@IsISBN()\n  `;
  else if (field.type === 'JSON') typeValidators += `@IsJSON()\n  `;
  else if (field.type === 'Currency') typeValidators += `@IsCurrency()\n  `;
  else if (field.type === 'PostalCode') typeValidators += `@IsPostalCode()\n  `;
  else if (field.type === 'PhoneNumber') typeValidators += `@IsPhoneNumber()\n  `;
  else if (field.type === 'HexColorCode') typeValidators += `@IsHexColor()\n  `
  else if (field.type === 'Boolean') typeValidators += `@IsBoolean()\n  `;
  else if (field.type === 'Date') typeValidators += `@IsDate()\n  `;
  else if (field.type === 'String' ) typeValidators += `@IsString()\n  `;
  else if (field.type.includes('Int')) typeValidators += `@IsInt()\n  `;
  return typeValidators;
}