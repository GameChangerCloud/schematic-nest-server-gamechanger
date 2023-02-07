import { Tree } from '@angular-devkit/schematics';
const path = require('path');

export function createTFVar(
  _tree: Tree,
  projectName: string,
  graphqlFileName: string,
) {
  const timeElapsed = Date.now();
  const nowISOFormat = new Date(timeElapsed).toISOString().slice(0, -5).replaceAll(':', '-').replace('T', 't');
  const graphqlName = path.parse(graphqlFileName).name.toLowerCase();

  let fileTemplate =
    `db_username = "postgres"
db_password = "postgres"
graphql_name = "${graphqlName}"
timestamp = "${nowISOFormat}"\n`;

  // Create Service file
  _tree.create(
    `${projectName}/terraform/terraform.tfvars`,
    fileTemplate
  );
}