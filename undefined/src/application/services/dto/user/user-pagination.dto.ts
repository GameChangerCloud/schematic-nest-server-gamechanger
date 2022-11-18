import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from 'adapters/typeorm/entities/user.model';
import {
    Pagination,
    PaginationArgs,
    PaginationSortBy,
    SortDirection,
} from 'application/services/dto/pagination/pagination.dto';

@InputType()
export class UsersPaginationSortBy extends PaginationSortBy {
    @Field(() => SortDirection, { nullable: true })
    username?: SortDirection;
}

@ArgsType()
export class UsersPaginationArgs extends PaginationArgs {
    @Field(() => UsersPaginationSortBy, { nullable: true })
    sortBy?: UsersPaginationSortBy;
}

@ObjectType()
export class UsersPagination extends Pagination {
    @Field(() => [User])
    nodes: User[];
}
    