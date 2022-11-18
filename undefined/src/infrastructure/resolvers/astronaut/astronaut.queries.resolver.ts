import { Resolver, Args, Query, ID } from '@nestjs/graphql';
    import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
    import { AstronautGetOneOutput } from 'application/services/dto/planet/planet-getOne.dto';
    import {
      AstronautsPagination,
      AstronautsPaginationArgs,
    } from 'application/services/dto/planet/planet-pagination.dto';
    import { AstronautService } from 'application/services/planet.service';
    
    @Resolver(Astronaut)
    export class AstronautQueriesResolver {
      constructor(private readonly planetsService: AstronautService) {}
    
      @Query(() => AstronautsPagination)
      async planetsPagination(@Args() args: PlanetsPaginationArgs) {
        return this.planetsService.planetsPagination(args);
      }
    
      @Query(() => PlanetGetOneOutput)
      async planetGetDataById(
        @Args({ name: 'planetId', type: () => ID }) planetId: Planet['id'],
      ) {
        return this.planetsService.planetGetDataById(planetId);
      }
    }
    