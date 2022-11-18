import { Resolver, Args, Query, ID } from '@nestjs/graphql';
    import { Employe } from 'adapters/typeorm/entities/employe.model';
    import { EmployeGetOneOutput } from 'application/services/dto/planet/planet-getOne.dto';
    import {
      EmployesPagination,
      EmployesPaginationArgs,
    } from 'application/services/dto/planet/planet-pagination.dto';
    import { EmployeService } from 'application/services/planet.service';
    
    @Resolver(Employe)
    export class EmployeQueriesResolver {
      constructor(private readonly planetsService: EmployeService) {}
    
      @Query(() => EmployesPagination)
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
    