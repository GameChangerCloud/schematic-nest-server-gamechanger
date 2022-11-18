import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import {
  PlanetCreateInput,
  PlanetCreateOutput,
} from './planet-create.dto';

@InputType()
export class PlanetUpdateInput extends PlanetCreateInput {}

@ObjectType()
export class PlanetUpdateOutput extends PlanetCreateOutput{
  @Field(() => Planet)
  planet: Planet;
}

    