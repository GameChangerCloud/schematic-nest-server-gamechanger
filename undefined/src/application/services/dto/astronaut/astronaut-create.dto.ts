import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import { Rank } from 'adapters/typeorm/entities/rank.enum';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import { User } from 'adapters/typeorm/entities/user.model';

@InputType()
export class AstronautCreateInput {
  @Field(() => Number)
  immat: number

  @Field(() => String)
  firstname: string

  @Field(() => String)
  lastname: string

  @Field(() => String, { nullable: true })
  picture?: string

  @Field(() => Rank)
  rank: Rank;
          
  @Field(() => String, { nullable: true })
  planetId?: Planet['id'] | null;
        
  @Field(() => String, { nullable: true })
  userId?: User['id'] | null;
        
}

@ObjectType()
export class AstronautCreateOutput {
@Field(() => Astronaut)
astronaut: Astronaut;
}
    