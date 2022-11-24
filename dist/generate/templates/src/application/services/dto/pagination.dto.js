"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationDto = void 0;
function paginationDto(_tree, projectName) {
    let fileTemplate = `
import {
ArgsType,
Field,
InputType,
Int,
InterfaceType,
registerEnumType,
} from '@nestjs/graphql';
import { Node } from 'adapters/typeorm/entities/node.model';

export enum SortDirection {
ASC,
DESC,
}

registerEnumType(SortDirection, {
name: 'SortDirection',
});

@InputType()
export class PaginationSortBy {
@Field(() => SortDirection, { nullable: true })
createdAt?: SortDirection;
}

@ArgsType()
export class PaginationArgs {
@Field(() => Int)
skip: number;

@Field(() => Int)
take: number;

@Field(() => PaginationSortBy, { nullable: true })
sortBy?: PaginationSortBy;
}

@InterfaceType()
export abstract class Pagination<N extends Node = Node> {
@Field()
totalCount: number;

@Field(() => [Node])
abstract nodes: N[];
}

    `;
    // Create Service file
    _tree.create(`${projectName}/src/application/services/dto/pagination.dto.ts`, fileTemplate);
}
exports.paginationDto = paginationDto;
//# sourceMappingURL=pagination.dto.js.map