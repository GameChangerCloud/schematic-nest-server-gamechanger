"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationEntityDto = void 0;
const core_1 = require("@angular-devkit/core");
const pluralize = require("pluralize");
function paginationEntityDto(type, _tree, projectName) {
    let fileTemplate = `import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { ${type.typeName} } from 'adapters/typeorm/entities/${core_1.strings.camelize(type.typeName)}.model';
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
    _tree.create(`${projectName}/src/application/services/dto/${type.typeName.toLowerCase()}/${type.typeName.toLowerCase()}-pagination.dto.ts`, fileTemplate);
}
exports.paginationEntityDto = paginationEntityDto;
//# sourceMappingURL=entity.pagination.dto.js.map