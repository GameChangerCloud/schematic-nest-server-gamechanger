import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Astronaut } from 'adapters/typeorm/entities/astronaut.model';
import { Planet } from 'adapters/typeorm/entities/planet.model';
import { User } from 'adapters/typeorm/entities/user.model';
import { AstronautService } from 'application/services/astronaut.service';
import { AstronautFieldsResolver } from 'infrastructure/resolvers/astronaut/astronaut.fields.resolver';
import { AstronautMutationsResolver } from 'infrastructure/resolvers/astronaut/astronaut.mutations.resolver';
import { AstronautQueriesResolver } from 'infrastructure/resolvers/astronaut/astronaut.queries.resolver';
import { PlanetModule } from './planet.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Astronaut, Planet, User]),
    forwardRef(() => PlanetModule),
    UserModule,
  ],
  providers: [
    AstronautService,
    AstronautMutationsResolver,
    AstronautQueriesResolver,
    AstronautFieldsResolver,
  ],
    exports: [AstronautService],
})
export class AstronautModule {}
