import { Resolver, Args, Query, ID } from '@nestjs/graphql';
    import { Work } from 'adapters/typeorm/entities/work.model';
    import { WorkGetOneOutput } from 'application/services/dto/planet/planet-getOne.dto';
    import {
      WorksPagination,
      WorksPaginationArgs,
    } from 'application/services/dto/planet/planet-pagination.dto';
    import { WorkService } from 'application/services/planet.service';
    
    @Resolver(Work)
    export class WorkQueriesResolver {
      constructor(private readonly planetsService: WorkService) {}
    
      @Query(() => WorksPagination)
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
    