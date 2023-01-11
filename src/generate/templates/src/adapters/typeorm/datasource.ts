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
if (process.env.SECRETARN) {
  AppDataSource = new DataSource({
    type: 'aurora-postgres',
    database: process.env.DATABASE,
    secretArn: process.env.SECRETARN,
    resourceArn: process.env.RESOURCEARN,
    region: 'eu-west-1',
    entities: [path.join(__dirname, '**', '*.model.js')],
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
