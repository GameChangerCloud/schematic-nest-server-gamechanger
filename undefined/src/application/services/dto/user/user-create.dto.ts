import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { User } from 'adapters/typeorm/entities/user.model';
import { Role } from 'adapters/typeorm/entities/role.enum';

@InputType()
export class UserCreateInput {
  @Field(() => String)
  username: string

  @Field(() => String)
  email: string

  @Field(() => [Role])
  roles: Role[];
        
}

@ObjectType()
export class UserCreateOutput {
@Field(() => User)
user: User;
}
    