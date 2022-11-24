import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import { IPlanetService } from 'domain/service/planet.service.interface';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import { AstronautService } from './astronaut.service';
import { PaginationArgs, SortDirection } from './dto/pagination/pagination.dto';
import { PlanetAstronautsPagination } from './dto/planet/planet-astronauts-pagination.dto';
import { PlanetCreateInput, PlanetCreateOutput } from './dto/planet/planet-create.dto';
import { PlanetDeleteOutput } from './dto/planet/planet-delete.dto';
import { PlanetGetOneOutput } from './dto/planet/planet-getOne.dto';
import {
  PlanetsPagination,
  PlanetsPaginationArgs,
} from './dto/planet/planet-pagination.dto';
import { PlanetUpdateInput, PlanetUpdateOutput } from './dto/planet/planet-update.dto';
    
@Injectable()
export class PlanetService implements IPlanetService {
  constructor(
    @InjectRepository(Planet)
    private readonly planetRepository: Repository<Planet>,
    @InjectRepository(Astronaut)
    private readonly astronautRepository: Repository<Astronaut>,
    @Inject(forwardRef(() => AstronautService))
    private readonly astronautService: AstronautService,
  ) {}
    
  async planetCreate(input: PlanetCreateInput): Promise<PlanetCreateOutput> {
    const planet = this.planetRepository.create(input);
    const mockAstronaut = new Astronaut();
    planet.astronauts = [mockAstronaut];
    if (input.astronautIds.length > 0) {
      for (let i = 0; i < input.astronautIds.length; i++) {
        const astronaut = await this.astronautService.astronautGetById(
          input.astronautIds[i],
        );
        planet.astronauts[i].id = astronaut.id;
      }
    }
    await planet.save();
    return { planet };
  }
    
  async planetUpdate(
    planetId: Planet['id'],
    input: PlanetUpdateInput,
  ): Promise<PlanetUpdateOutput> {
    const planet = await this.planetRepository.findOneOrFail({
      where: { id: planetId },
    });
    planet.name = input.name;
    planet.picture = input.picture;
    planet.points = input.points;
    if (input.astronautIds) {
      const linkedAstronauts: Astronaut[] = [];
      input.astronautIds.forEach(async (astronautId) => {
        linkedAstronauts.push(
          await this.astronautService.astronautGetById(astronautId),
        );
      });
      planet.astronauts = linkedAstronauts;
    }
    await planet.save();
    return { planet };
  }
    
  async planetDelete(planetId: Planet['id']): Promise<PlanetDeleteOutput> {
    const planet = await this.planetRepository.findOneOrFail({
      where: { id: planetId },
    });
    await planet.remove();
    return { planetId };
  }
    
  async planetsPagination(args: PlanetsPaginationArgs): Promise<PlanetsPagination> {
    const queryBuilder = this.planetRepository.createQueryBuilder('planet');
    queryBuilder.take(args.take);
    queryBuilder.skip(args.skip);
    if (args.sortBy) {
      if (args.sortBy.createdAt !== null) {
        queryBuilder.addOrderBy(
          'planet.createdAt',
          args.sortBy.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
      if (args.sortBy.name !== null) {
        queryBuilder.addOrderBy(
          'planet.name',
          args.sortBy.name === SortDirection.ASC ? 'ASC' : 'DESC',
        );
      }
    }
    const [nodes, totalCount] = await queryBuilder.getManyAndCount();
    return { nodes, totalCount };
  }
    
  async planetGetDataById(planetId: Planet['id']): Promise<PlanetGetOneOutput> {
    const planet = await this.planetRepository.findOneOrFail({
      where: { id: planetId },
    });
    return { planet };
  }

  async planetGetById(planetId: Planet['id']): Promise<Planet> {
    return await this.planetRepository.findOneOrFail({
      where: { id: planetId },
    });
  }
  
  async planetAstronautsPagination(
    planetId: Planet['id'],
    args: PaginationArgs,
  ): Promise<PlanetAstronautsPagination> {
    const [nodes, totalCount] = await this.astronautRepository.findAndCount({
      skip: args.skip,
      take: args.take,
      where: {
        planet: {
          id: planetId,
        },
      },
      order: {
        createdAt:
          args.sortBy?.createdAt === SortDirection.ASC ? 'ASC' : 'DESC',
        },
    });

    return {
      nodes,
      totalCount,
    };
  }
}
