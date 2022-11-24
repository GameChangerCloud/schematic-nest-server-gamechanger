import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createAppModule(
  types: Type[],
  _tree: Tree,
  projectName: string
) {
    let entitiesModules = '';
    let entitiesModulesImport = '';
    types
      .filter((type) => type.type === 'ObjectTypeDefinition')
      .forEach((type) => {
        entitiesModules += `
    ${type.typeName}Module,`;
        entitiesModulesImport += `
import { ${type.typeName}Module } from 'infrastructure/modules/${strings.camelize(type.typeName)}.module';`
      });
    
    let fileTemplate = `import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Constants } from 'config/credentials';${entitiesModulesImport}
import { GraphQLYogaDriver } from './graphql-yoga-driver';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: GraphQLYogaDriver,
      autoSchemaFile: 'schema.gql',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'postgres',
        host: Constants.DATABASE_HOST,
        port: Constants.DATABASE_PORT,
        username: Constants.DATABASE_USER,
        password: Constants.DATABASE_PASSWORD,
        database: Constants.DATABASE_DB,
        entities: [join(__dirname, '**', '*.model.{ts,js}')],
        synchronize: true,
      }),
    }),${entitiesModules}
  ],
})
export class AppModule {}
`;
    // Create Service file
    _tree.create(
      `${projectName}/src/app.module.ts`,
      fileTemplate
    );
}
