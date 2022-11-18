import { Resolver, Args, Query, ID } from '@nestjs/graphql';
    import { Planet } from 'adapters/typeorm/entities/planet.model';
    import { PlanetGetOneOutput } from 'application/services/dto/planet/planet-getOne.dto';
    import {
      PlanetsPagination,
      PlanetsPaginationArgs,
    } from 'application/services/dto/planet/planet-pagination.dto';
    import { PlanetService } from 'application/services/planet.service';
    
    @Resolver(Planet)
    export class PlanetQueriesResolver {
      constructor(private readonly planetsService: PlanetService) {}
    
      @Query(() => PlanetsPagination)
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
    