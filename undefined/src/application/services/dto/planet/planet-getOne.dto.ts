import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PlanetCreateOutput } from './planet-create.dto';

@ObjectType()
export class PlanetGetOneOutput extends PlanetCreateOutput {}
    
    