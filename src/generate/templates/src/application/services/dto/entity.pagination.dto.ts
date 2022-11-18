import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';
const pluralize = require("pluralize");

export function paginationEntityDto(
    type: Type,
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = `import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${strings.camelize(type.typeName)}.model';
import {
    Pagination,
    PaginationArgs,
    PaginationSortBy,
    SortDirection,
} from 'application/services/dto/pagination/pagination.dto';

@InputType()
export class ${pluralize(type.typeName)}PaginationSortBy extends PaginationSortBy {
    @Field(() => SortDirection, { nullable: true })
    ${type.fields[1].name.toLocaleLowerCase()}?: SortDirection;
}

@ArgsType()
export class ${pluralize(type.typeName)}PaginationArgs extends PaginationArgs {
    @Field(() => ${pluralize(type.typeName)}PaginationSortBy, { nullable: true })
    sortBy?: ${pluralize(type.typeName)}PaginationSortBy;
}

@ObjectType()
export class ${pluralize(type.typeName)}Pagination extends Pagination {
    @Field(() => [${type.typeName}])
    nodes: ${type.typeName}[];
}
    `;

    // Create Service file
    _tree.create(
      `${projectName}/src/application/services/dto/${
        type.typeName.toLowerCase()
    }/${
        type.typeName.toLowerCase()
    }-pagination.dto.ts`,
      fileTemplate
    );
}