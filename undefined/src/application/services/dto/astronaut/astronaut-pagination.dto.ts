import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import {
    Pagination,
    PaginationArgs,
    PaginationSortBy,
    SortDirection,
} from 'application/services/dto/pagination/pagination.dto';

@InputType()
export class AstronautsPaginationSortBy extends PaginationSortBy {
    @Field(() => SortDirection, { nullable: true })
    immat?: SortDirection;
}

@ArgsType()
export class AstronautsPaginationArgs extends PaginationArgs {
    @Field(() => AstronautsPaginationSortBy, { nullable: true })
    sortBy?: AstronautsPaginationSortBy;
}

@ObjectType()
export class AstronautsPagination extends Pagination {
    @Field(() => [Astronaut])
    nodes: Astronaut[];
}
    