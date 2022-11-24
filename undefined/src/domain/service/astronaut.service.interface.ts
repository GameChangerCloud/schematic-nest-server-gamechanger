import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import {
  AstronautCreateInput,
  AstronautCreateOutput,
} from 'application/services/dto/astronaut/astronaut-create.dto';
import { AstronautDeleteOutput } from 'application/services/dto/astronaut/astronaut-delete.dto';
import { AstronautGetOneOutput } from 'application/services/dto/astronaut/astronaut-getOne.dto';
import {
  AstronautsPagination,
  AstronautsPaginationArgs,
} from 'application/services/dto/astronaut/astronaut-pagination.dto';
import {
  AstronautUpdateInput,
  AstronautUpdateOutput,
} from 'application/services/dto/astronaut/astronaut-update.dto';

export interface IAstronautService {
  astronautCreate(input: AstronautCreateInput): Promise<AstronautCreateOutput>;

  astronautUpdate(
    astronautId: Astronaut['id'],
    input: AstronautUpdateInput,
  ): Promise<AstronautUpdateOutput>;

  astronautDelete(astronautId: Astronaut['id']): Promise<AstronautDeleteOutput>;

  astronautsPagination(args: AstronautsPaginationArgs): Promise<AstronautsPagination>;

  astronautGetById(id: Astronaut['id']): Promise<Astronaut>;

  astronautGetDataById(id: Astronaut['id']): Promise<AstronautGetOneOutput>;
}
