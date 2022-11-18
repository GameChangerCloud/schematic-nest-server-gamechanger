import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import {
  AstronautCreateInput,
  AstronautCreateOutput,
} from './astronaut-create.dto';

@InputType()
export class AstronautUpdateInput extends AstronautCreateInput {}

@ObjectType()
export class AstronautUpdateOutput extends AstronautCreateOutput{
  @Field(() => Astronaut)
  astronaut: Astronaut;
}

    