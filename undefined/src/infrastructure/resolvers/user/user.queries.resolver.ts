import { Resolver, Args, Query, ID } from '@nestjs/graphql';
    import { User } from 'adapters/typeorm/entities/user.model';
    import { UserGetOneOutput } from 'application/services/dto/planet/planet-getOne.dto';
    import {
      UsersPagination,
      UsersPaginationArgs,
    } from 'application/services/dto/planet/planet-pagination.dto';
    import { UserService } from 'application/services/planet.service';
    
    @Resolver(User)
    export class UserQueriesResolver {
      constructor(private readonly planetsService: UserService) {}
    
      @Query(() => UsersPagination)
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
    