import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import { PlanetService } from 'application/services/planet.service';
import { PlanetFieldsResolver } from 'infrastructure/resolvers/planet/planet.fields.resolver';
import { PlanetMutationsResolver } from 'infrastructure/resolvers/planet/planet.mutations.resolver';
import { PlanetQueriesResolver } from 'infrastructure/resolvers/planet/planet.queries.resolver';
import { AstronautModule } from './astronaut.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Planet, Astronaut]),
    forwardRef(() => AstronautModule),
  ],
  providers: [
    PlanetService,
    PlanetMutationsResolver,
    PlanetQueriesResolver,
    PlanetFieldsResolver,
  ],
    exports: [PlanetService],
})
export class PlanetModule {}
