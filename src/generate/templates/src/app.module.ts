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
    .filter((type) => type.type === 'ObjectTypeDefinition' && type.isNotOperation())
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
import * as path from 'path';
import { Constants } from 'config/credentials';${entitiesModulesImport}
import { GraphQLYogaDriver } from './graphql-yoga-driver';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: GraphQLYogaDriver,
      debug: true,
      playground: false,
      autoSchemaFile: () => {
        if (true) {
          return path.join(__dirname, '../schema.gql')
        } else {
          return path.join(__dirname, 'schema.gql')
        }
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        if (process.env.DATABASE_HOST) {
          return {
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            entities: [path.join(__dirname, '**', '*.model.js')],
            port: parseInt(process.env.DATABASE_PORT, 10),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_DB,
            synchronize: false,
            playground: false,
            retryAttempts: 3,
            logging: true,
            debug: true,
          };
        } else {
          return {
            type: 'postgres',
            host: Constants.DATABASE_HOST,
            port: Constants.DATABASE_PORT,
            username: Constants.DATABASE_USER,
            password: Constants.DATABASE_PASSWORD,
            database: Constants.DATABASE_DB,
            entities: [path.join(__dirname, '**', '*.model.js')],
            synchronize: true,
            playground: true,
            retryAttempts: 3,
            logging: true,
            debug: true,
          };
        }
      },
    }),${entitiesModules}
  ],
})
export class AppModule {}\n`;
  // Create Service file
  _tree.create(
    `${projectName}/src/app.module.ts`,
    fileTemplate
  );
}
