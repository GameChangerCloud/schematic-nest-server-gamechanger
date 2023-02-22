import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createGetOneDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `import { ObjectType } from '@nestjs/graphql';
import { ${type.typeName}CreateOutput } from './${strings.camelize(type.typeName)}-create.dto';

@ObjectType('${type.typeName}GetOneOutput')
export class ${type.typeName}GetOneOutput extends ${type.typeName}CreateOutput {}\n`;

  _tree.create(
    `${projectName}/src/application/services/dto/${strings.camelize(
      type.typeName
    )}/${strings.camelize(
      type.typeName
    )}-getOne.dto.ts`,
    fileTemplate
  );
}