import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AstronautCreateOutput } from './astronaut-create.dto';

@ObjectType()
export class AstronautGetOneOutput extends AstronautCreateOutput {}
    
    