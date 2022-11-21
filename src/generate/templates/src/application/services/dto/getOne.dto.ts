import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createGetOneDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ${type.typeName}CreateOutput } from './${strings.camelize(type.typeName)}-create.dto';

@ObjectType()
export class ${type.typeName}GetOneOutput extends ${type.typeName}CreateOutput {}
    
    `;

    // Create Service file
    _tree.create(
      `${projectName}/src/application/services/dto/${strings.camelize(
        type.typeName
      )}/${strings.camelize(
        type.typeName
      )}-getOne.dto.ts`,
      fileTemplate
    );
}