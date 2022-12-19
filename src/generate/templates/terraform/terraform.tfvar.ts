import { Tree } from '@angular-devkit/schematics';
const path = require('path');

export function createTFVar(
    _tree: Tree,
    projectName: string,
    graphqlFileName: string,
) {
    const graphqlName = path.parse(graphqlFileName).name;
    let fileTemplate = 
`db_username = "postgres"
db_password = "postgres"
cluster_db = "aurora-${graphqlName}"
db_name = "${graphqlName}_db"
rds_name ="${graphqlName}-db"
api_name = "${graphqlName}_api"
policy_name = "${graphqlName}_policy"
role_name = "${graphqlName}_role"
lambda_name = "${graphqlName}_lambda"
secret_name = "${graphqlName}-secret"\n`;

// Create Service file
  _tree.create(
    `${projectName}/terraform/terraform.tfvar`,
    fileTemplate
  );
}