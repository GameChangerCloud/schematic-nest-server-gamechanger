import { Tree } from '@angular-devkit/schematics';

export function createDatasource(
    _tree: Tree,
    projectName: string
) {

    let fileTemplate = 
`import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Constants } from 'config/credentials';
import * as path from 'path';

let AppDataSource: DataSource;
if (true) {
  AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    entities: [path.join(__dirname, '**', '*.model.js')],
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB,
    synchronize: false,
    logging: true,
  });
} else {
  AppDataSource = new DataSource({
    type: 'postgres',
    host: Constants.DATABASE_HOST,
    port: Constants.DATABASE_PORT,
    username: Constants.DATABASE_USER,
    password: Constants.DATABASE_PASSWORD,
    database: Constants.DATABASE_DB,
    entities: [path.join(__dirname, '**', '*.model.js')],
    synchronize: true,
    logging: true,
  });
}

export { AppDataSource };\n`;

  // Create Service file
  _tree.create(
    `${projectName}/src/adapters/typeorm/datasource.ts`,
    fileTemplate
  );
}
