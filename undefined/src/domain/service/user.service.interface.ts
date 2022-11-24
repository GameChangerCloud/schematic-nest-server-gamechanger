import { User } from 'adapters/typeorm/entities/user.model';
import {
  UserCreateInput,
  UserCreateOutput,
} from 'application/services/dto/user/user-create.dto';
import { UserDeleteOutput } from 'application/services/dto/user/user-delete.dto';
import { UserGetOneOutput } from 'application/services/dto/user/user-getOne.dto';
import {
  UsersPagination,
  UsersPaginationArgs,
} from 'application/services/dto/user/user-pagination.dto';
import {
  UserUpdateInput,
  UserUpdateOutput,
} from 'application/services/dto/user/user-update.dto';

export interface IUserService {
  userCreate(input: UserCreateInput): Promise<UserCreateOutput>;

  userUpdate(
    userId: User['id'],
    input: UserUpdateInput,
  ): Promise<UserUpdateOutput>;

  userDelete(userId: User['id']): Promise<UserDeleteOutput>;

  usersPagination(args: UsersPaginationArgs): Promise<UsersPagination>;

  userGetById(id: User['id']): Promise<User>;

  userGetDataById(id: User['id']): Promise<UserGetOneOutput>;
}
