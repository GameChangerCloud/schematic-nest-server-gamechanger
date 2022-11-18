import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import {
    Pagination,
    PaginationArgs,
    PaginationSortBy,
    SortDirection,
} from 'application/services/dto/pagination/pagination.dto';

@InputType()
export class PlanetsPaginationSortBy extends PaginationSortBy {
    @Field(() => SortDirection, { nullable: true })
    name?: SortDirection;
}

@ArgsType()
export class PlanetsPaginationArgs extends PaginationArgs {
    @Field(() => PlanetsPaginationSortBy, { nullable: true })
    sortBy?: PlanetsPaginationSortBy;
}

@ObjectType()
export class PlanetsPagination extends Pagination {
    @Field(() => [Planet])
    nodes: Planet[];
}
    