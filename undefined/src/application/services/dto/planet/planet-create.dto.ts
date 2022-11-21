import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { Planet } from 'adapters/typeorm/entities/planet.model';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';

@InputType()
export class PlanetCreateInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  picture: string

  @Field(() => Number)
  points: number

  @Field(() => [String], { nullable: true })
  astronautIds?: Astronaut['id'][] | null;
        
}

@ObjectType()
export class PlanetCreateOutput {
@Field(() => Planet)
planet: Planet;
}
    