import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { User } from 'adapters/typeorm/entities/user.model';
import { Role } from 'adapters/typeorm/entities/role.model';

@InputType()
export class UserCreateInput {
  @Field(() => String)
  username : string

  @Field(() => String)
  email : string


    @Field(() => [String], { nullable: true })
    roleIds?: Role['id'][] | null;
        
    }

@ObjectType()
export class UserCreateOutput {
@Field(() => User)
user: User;
}
    