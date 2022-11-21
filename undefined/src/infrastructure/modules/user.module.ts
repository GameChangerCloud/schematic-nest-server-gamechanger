import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'adapters/typeorm/entities/user.model';
import { UserService } from 'application/services/user.service';
import { UserMutationsResolver } from 'infrastructure/resolvers/user/user.mutations.resolver';
import { UserQueriesResolver } from 'infrastructure/resolvers/user/user.queries.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UserService,
    UserMutationsResolver,
    UserQueriesResolver,
  ],
    exports: [UserService],
})
export class UserModule {}
