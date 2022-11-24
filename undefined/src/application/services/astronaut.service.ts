import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import { IAstronautService } from 'domain/service/astronaut.service.interface';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import { PlanetService } from './planet.service';
import { User } from 'adapters/typeorm/entities/user.model';
import { UserService } from './user.service';
import { SortDirection } from './dto/pagination/pagination.dto';
import { AstronautCreateInput, AstronautCreateOutput } from './dto/astronaut/astronaut-create.dto';
import { AstronautDeleteOutput } from './dto/astronaut/astronaut-delete.dto';
import { AstronautGetOneOutput } from './dto/astronaut/astronaut-getOne.dto';
import {
  AstronautsPagination,
  AstronautsPaginationArgs,
} from './dto/astronaut/astronaut-pagination.dto';
import { AstronautUpdateInput, AstronautUpdateOutput } from './dto/astronaut/astronaut-update.dto';
    
@Injectable()
export class AstronautService implements IAstronautService {
  constructor(
    @InjectRepository(Astronaut)
    private readonly astronautRepository: Repository<Astronaut>,
    @Inject(forwardRef(() => PlanetService))
    private readonly planetService: PlanetService,
    private readonly userService: UserService,
  ) {}
    
  async astronautCreate(input: AstronautCreateInput): Promise<AstronautCreateOutput> {
    const astronaut = this.astronautRepository.create(input);
    astronaut.planet = new Planet();
    astronaut.user = new User();
    if (input.planetId) {
      const planet = await this.planetService.planetGetById(input.planetId);
      astronaut.planet.id = planet.id;
    }
    if (input.userId) {
      const user = await this.userService.userGetById(input.userId);
      astronaut.user.id = user.id;
    }
    await astronaut.save();
    return { astronaut };
  }
    
  async astronautUpdate(
    astronautId: Astronaut['id'],
    input: AstronautUpdateInput,
  ): Promise<AstronautUpdateOutput> {
    const astronaut = await this.astronautRepository.findOneOrFail({
      where: { id: astronautId },
    });
    astronaut.immat = input.immat;
    astronaut.firstname = input.firstname;
    astronaut.lastname = input.lastname;
    astronaut.picture = input.picture;
    astronaut.rank = input.rank;
    if (input.planetId) {
      astronaut.planet = new Planet();
      const planet = await this.planetService.planetGetById(input.planetId);
      astronaut.planet.id = planet.id;
    }
    if (input.userId) {
      astronaut.user = new User();
      const user = await this.userService.userGetById(input.userId);
      astronaut.user.id = user.id;
    }
    await astronaut.save();
    return { astronaut };
  }
    
  async astronautDelete(astronautId: Astronaut['id']): Promise<AstronautDeleteOutput> {
    const astronaut = await this.astronautRepository.findOneOrFail({
      where: { id: astronautId },
    });
    await astronaut.remove();
    return { astronautId };
  }
    
  async astronautsPagination(args: AstronautsPaginationArgs): Promise<AstronautsPagination> {
    const queryBuilder = this.astronautRepository.createQueryBuilder('astronaut');
    queryBuilder.take(args.take);
    queryBuilder.skip(args.skip);
    if (args.sortBy) {
      if (args.sortBy.createdAt !== null) {
        queryBuilder.addOrderBy(
          'astronaut.createdAt',
          args.sortBy.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
      if (args.sortBy.immat !== null) {
        queryBuilder.addOrderBy(
          'astronaut.immat',
          args.sortBy.immat === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
    }
    const [nodes, totalCount] = await queryBuilder.getManyAndCount();
    return { nodes, totalCount };
  }
    
  async astronautGetDataById(astronautId: Astronaut['id']): Promise<AstronautGetOneOutput> {
    const astronaut = await this.astronautRepository.findOneOrFail({
      where: { id: astronautId },
    });
    return { astronaut };
  }

  async astronautGetById(astronautId: Astronaut['id']): Promise<Astronaut> {
    return await this.astronautRepository.findOneOrFail({
      where: { id: astronautId },
    });
  }
  
}
