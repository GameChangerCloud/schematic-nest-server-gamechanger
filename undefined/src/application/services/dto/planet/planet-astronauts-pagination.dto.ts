import { Field, ObjectType } from '@nestjs/graphql';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import { Pagination } from '../pagination/pagination.dto';
    
@ObjectType()
export class PlanetAstronautsPagination extends Pagination {
  @Field(() => [Astronaut])
  nodes: Astronaut[];
}
