import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createUpdateDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import {
  ${type.typeName}CreateInput,
  ${type.typeName}CreateOutput,
} from './${strings.camelize(type.typeName)}-create.dto';

@InputType()
export class ${type.typeName}UpdateInput extends ${type.typeName}CreateInput {}

@ObjectType()
export class ${type.typeName}UpdateOutput extends ${type.typeName}CreateOutput{
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