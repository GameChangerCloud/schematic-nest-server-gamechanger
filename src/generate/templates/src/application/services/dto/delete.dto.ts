import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function deleteDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `
    import { Field, ID, ObjectType } from '@nestjs/graphql';
    import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
    
    @ObjectType()
    export class ${type.typeName}DeleteOutput {
      @Field(() => ID)
      ${strings.camelize(type.typeName)}: ${type.typeName}['id'];
    }
    `;

    // Create Service file
    _tree.create(
      `${projectName}/src/application/services/dto/${strings.camelize(
        type.typeName
      )}/${strings.camelize(
        type.typeName
      )}-delete.dto.ts`,
      fileTemplate
    );
}