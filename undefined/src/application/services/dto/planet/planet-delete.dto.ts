
    import { Field, ID, ObjectType } from '@nestjs/graphql';
    import { Planet } from 'adapters/typeorm/entities/planet.model';
    
    @ObjectType()
    export class PlanetDeleteOutput {
      @Field(() => ID)
      planet: Planet['id'];
    }
    