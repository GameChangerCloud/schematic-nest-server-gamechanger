import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import { Rank } from 'adapters/typeorm/entities/rank.model';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import { User } from 'adapters/typeorm/entities/user.model';

@InputType()
export class AstronautCreateInput {
  @Field(() => String)
  firstname : string

  @Field(() => String)
  lastname : string

  @Field(() => String, { nullable: true })
  picture? : string

  @Field(() => String, { nullable: true })
  rankId?: Rank['id'] | null;
        
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
    