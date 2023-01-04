import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';

export function createCreateDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `import { ${handleIdField(type)[0]}Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  ${type.typeName}UpdateInput,
  ${type.typeName}UpdateOutput,
} from './${strings.camelize(type.typeName)}-update.dto';${handleIdField(type)[1]}

@InputType('${type.typeName}CreateInput')
export class ${type.typeName}CreateInput extends ${type.typeName}UpdateInput {${handleIdField(type)[2]}}

@ObjectType('${type.typeName}CreateOutput')
export class ${type.typeName}CreateOutput extends ${type.typeName}UpdateOutput {}
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

function handleIdField(type: Type): string[] {
  let idImport = ``;
  let idFieldTemplate = ``;
  let fieldDirective = '';
  let importValidatorsTemplate = '';
  let validatorsToImport: string[] = [];
  const idField = type.fields.find((field) => field.type === 'ID');
  if (idField) {
    idImport += `ID, `;
    [fieldDirective, validatorsToImport] = computeFieldDirective(idField);
    if (validatorsToImport.length > 0) {
      importValidatorsTemplate = `\nimport { ${validatorsToImport.join(', ')} } from 'class-validator';`;
    }
    idFieldTemplate += `\n  ${fieldDirective}@Field(() => ID)\n  id: string;\n`
  }
  return [idImport, importValidatorsTemplate, idFieldTemplate]
}

function computeFieldDirective(scalar: Field): [string, string[]] {
  let directiveTemplate = '';
  let validatorsToImport: string[] = [];
  const lengthDirective = scalar.directives.find((dir: { name: string, args: { name: string, value: string }[] }) => dir.name === 'length');
  if (lengthDirective) {
    let minLength = lengthDirective.args.find((arg: { name: string, value: string }) => arg.name === 'min');
    let maxLength = lengthDirective.args.find((arg: { name: string, value: string }) => arg.name === 'max');
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
  return [directiveTemplate, validatorsToImport]
}