import { strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { Type } from 'easygraphql-parser-gamechanger';

export function createDatasource(
    types: Type[],
    _tree: Tree,
    projectName: string
) {
    let [entitiesImports, entitiesList] = computeEntitiesListAndImports(types);

    let fileTemplate = 
`import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Constants } from 'config/credentials';${entitiesImports}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Constants.DATABASE_HOST,
  port: Constants.DATABASE_PORT,
  username: Constants.DATABASE_USER,
  password: Constants.DATABASE_PASSWORD,
  database: Constants.DATABASE_DB,
  synchronize: true,
  logging: true,
  entities: [${entitiesList}],
  subscribers: [],
  migrations: [],
});\n`;

  // Create Service file
  _tree.create(
    `${projectName}/src/adapters/typeorm/datasource.ts`,
    fileTemplate
  );
}

function computeEntitiesListAndImports(types: Type[]) {
  let entitiesImports = '';
  let entitiesList = '';
  let objectTypes = types.filter((type) => type.type === "ObjectTypeDefinition");
  for (let i = 0; i < objectTypes.length; i++) {
    entitiesImports += `\nimport { ${objectTypes[i].typeName} } from './entities/${strings.camelize(objectTypes[i].typeName)}.model';`;
    if (i === objectTypes.length - 1) entitiesList += `${objectTypes[i].typeName}`;
    else entitiesList += `${objectTypes[i].typeName}, `;
  }

  return [entitiesImports, entitiesList];
}
