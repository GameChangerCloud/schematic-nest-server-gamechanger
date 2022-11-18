import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from 'adapters/typeorm/entities/user.model';
import {
  UserCreateInput,
  UserCreateOutput,
} from './user-create.dto';

@InputType()
export class UserUpdateInput extends UserCreateInput {}

@ObjectType()
export class UserUpdateOutput extends UserCreateOutput{
  @Field(() => User)
  user: User;
}

    