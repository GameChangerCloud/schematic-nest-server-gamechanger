import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserCreateOutput } from './user-create.dto';

@ObjectType()
export class UserGetOneOutput extends UserCreateOutput {}
    
    