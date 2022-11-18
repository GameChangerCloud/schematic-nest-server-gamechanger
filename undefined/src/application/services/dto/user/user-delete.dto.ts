
    import { Field, ID, ObjectType } from '@nestjs/graphql';
    import { User } from 'adapters/typeorm/entities/user.model';
    
    @ObjectType()
    export class UserDeleteOutput {
      @Field(() => ID)
      user: User['id'];
    }
    