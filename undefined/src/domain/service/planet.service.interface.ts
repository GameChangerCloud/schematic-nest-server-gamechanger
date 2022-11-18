
import { Planet } from 'adapters/typeorm/entities/planet.model';
import {
  PlanetCreateInput,
  PlanetCreateOutput,
} from 'application/services/dto/planet/planet-create.dto';
import { PlanetDeleteOutput } from 'application/services/dto/planet/planet-delete.dto';
import { PlanetGetOneOutput } from 'application/services/dto/planet/planet-getOne.dto';
import {
  PlanetsPagination,
  PlanetsPaginationArgs,
} from 'application/services/dto/planet/planet-pagination.dto';
import {
  PlanetUpdateInput,
  PlanetUpdateOutput,
} from 'application/services/dto/planet/planet-update.dto';

export interface IPlanetService {
  planetCreate(input: PlanetCreateInput): Promise<PlanetCreateOutput>;

  planetUpdate(
    planetId: Planet['id'],
    input: PlanetUpdateInput,
  ): Promise<PlanetUpdateOutput>;

  planetDelete(planetId: Planet['id']): Promise<PlanetDeleteOutput>;

  planetssPagination(
    args: PlanetsPaginationArgs,
  ): Promise<PlanetsPagination>;

  planetGetById(id: Planet['id']): Promise<Planet>;

  planetGetDataById(id: Planet['id']): Promise<PlanetGetOneOutput>;
}
