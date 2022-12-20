import { Tree } from '@angular-devkit/schematics';
const path = require('path');

export function createTFVar(
    _tree: Tree,
    projectName: string,
    graphqlFileName: string,
) {
    const timeElapsed = Date.now();
    const nowISOFormat = new Date(timeElapsed).toISOString().slice(0, -5);
    const graphqlName = path.parse(graphqlFileName).name;

    let fileTemplate = 
`db_username = "postgres"
db_password = "postgres"
cluster_db = "aurora-${graphqlName + '_' + nowISOFormat}"
db_name = "${graphqlName + '_' + nowISOFormat}_db"
rds_name ="${graphqlName + '_' + nowISOFormat}-db"
api_name = "${graphqlName + '_' + nowISOFormat}_api"
policy_name = "${graphqlName + '_' + nowISOFormat}_policy"
role_name = "${graphqlName + '_' + nowISOFormat}_role"
lambda_name = "${graphqlName + '_' + nowISOFormat}_lambda"
secret_name = "${graphqlName + '_' + nowISOFormat}-secret"\n`;

// Create Service file
  _tree.create(
    `${projectName}/terraform/terraform.tfvar`,
    fileTemplate
  );
}