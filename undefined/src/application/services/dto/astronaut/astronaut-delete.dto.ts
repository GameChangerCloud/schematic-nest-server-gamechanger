
    import { Field, ID, ObjectType } from '@nestjs/graphql';
    import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
    
    @ObjectType()
    export class AstronautDeleteOutput {
      @Field(() => ID)
      astronaut: Astronaut['id'];
    }
    