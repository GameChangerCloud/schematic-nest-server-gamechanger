import { Tree } from '@angular-devkit/schematics';

export function createCredentials(
    _tree: Tree,
    projectName: string
) {
    let fileTemplate = 
`export const Constants = {
  PORT: 4242,
  JWT_SECRET: 'secretKey',
  // Database Config
  DATABASE_TYPE: 'postgres',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 5432,
  DATABASE_USER: 'postgres',
  DATABASE_PASSWORD: 'postgres',
  DATABASE_DB: 'postgres',
};\n`;

// Create Service file
    _tree.create(
    `${projectName}/src/config/credentials.ts`,
    fileTemplate
    );
}