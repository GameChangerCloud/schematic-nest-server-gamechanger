import { Tree } from '@angular-devkit/schematics';
const path = require('path');

export function createTFVar(
    _tree: Tree,
    projectName: string,
    graphqlFileName: string,
) {
    const timeElapsed = Date.now();
    const nowISOFormat = new Date(timeElapsed).toISOString().slice(0, -5).replaceAll(':', '-').replace('T', 't');
    const graphqlName = path.parse(graphqlFileName).name;

    let fileTemplate = 
`db_username = "postgres"
db_password = "postgres"
cluster_db = "aurora-${graphqlName + '-' + nowISOFormat}"
db_name = "${graphqlName.replaceAll('-', '') + nowISOFormat.replaceAll('-', '')}"
rds_name ="${graphqlName + '-' + nowISOFormat}-db"
api_name = "${graphqlName + '-' + nowISOFormat}_api"
policy_name = "${graphqlName + '-' + nowISOFormat}_policy"
role_name = "${graphqlName + '-' + nowISOFormat}_role"
lambda_name = "${graphqlName + '-' + nowISOFormat}_lambda"
secret_name = "${graphqlName + '-' + nowISOFormat}-secret"\n`;

// Create Service file
  _tree.create(
    `${projectName}/terraform/terraform.tfvars`,
    fileTemplate
  );
}