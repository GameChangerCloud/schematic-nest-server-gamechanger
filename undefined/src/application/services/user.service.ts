import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'adapters/typeorm/entities/user.model';
import { IUserService } from 'domain/service/user.service.interface';
import { SortDirection } from './dto/pagination/pagination.dto';
import { UserCreateInput, UserCreateOutput } from './dto/user/user-create.dto';
import { UserDeleteOutput } from './dto/user/user-delete.dto';
import { UserGetOneOutput } from './dto/user/user-getOne.dto';
import {
  UsersPagination,
  UsersPaginationArgs,
} from './dto/user/user-pagination.dto';
import { UserUpdateInput, UserUpdateOutput } from './dto/user/user-update.dto';
    
@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
    
  async userCreate(input: UserCreateInput): Promise<UserCreateOutput> {
    const user = this.userRepository.create(input);
    await user.save();
    return { user };
  }
    
  async userUpdate(
    userId: User['id'],
    input: UserUpdateInput,
  ): Promise<UserUpdateOutput> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    user.username = input.username;
    user.email = input.email;
    user.roles = input.roles;
    await user.save();
    return { user };
  }
    
  async userDelete(userId: User['id']): Promise<UserDeleteOutput> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    await user.remove();
    return { userId };
  }
    
  async usersPagination(args: UsersPaginationArgs): Promise<UsersPagination> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.take(args.take);
    queryBuilder.skip(args.skip);
    if (args.sortBy) {
      if (args.sortBy.createdAt !== null) {
        queryBuilder.addOrderBy(
          'user.createdAt',
          args.sortBy.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
      if (args.sortBy.username !== null) {
        queryBuilder.addOrderBy(
          'user.username',
          args.sortBy.username === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
    }
    const [nodes, totalCount] = await queryBuilder.getManyAndCount();
    return { nodes, totalCount };
  }
    
  async userGetDataById(userId: User['id']): Promise<UserGetOneOutput> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    return { user };
  }

  async userGetById(userId: User['id']): Promise<User> {
    return await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
  }
  
}
