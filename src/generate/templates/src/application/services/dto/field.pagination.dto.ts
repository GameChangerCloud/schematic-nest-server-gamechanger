import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
import { Field } from 'easygraphql-parser-gamechanger/dist/models/field';

export function createFieldPaginationDto(
    type: Type,
    relatedField: Field,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `import { Field, ObjectType } from '@nestjs/graphql';
import { ${relatedField.type} } from 'adapters/typeorm/entities/${strings.camelize(relatedField.type)}.model';
import { Pagination } from '../pagination/pagination.dto';
    
@ObjectType()
export class ${type.typeName}${strings.capitalize(relatedField.name)}Pagination extends Pagination {
  @Field(() => [${relatedField.type}])
  nodes: ${relatedField.type}[];
}
`;

    // Create Service file
    _tree.create(
      `${projectName}/src/application/services/dto/${
        strings.camelize(type.typeName)
    }/${
        strings.camelize(type.typeName)
    }-${
        strings.camelize(relatedField.name)
    }-pagination.dto.ts`,
      fileTemplate
    );
}