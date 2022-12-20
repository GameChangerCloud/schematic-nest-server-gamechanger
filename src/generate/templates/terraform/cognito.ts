import { Tree } from '@angular-devkit/schematics';
const path = require('path');

export function createCognito(
    _tree: Tree,
    projectName: string,
    graphqlFileName: string,
) {
    const timeElapsed = Date.now();
    const nowISOFormat = new Date(timeElapsed).toISOString().slice(0, -5);
    const graphqlName = path.parse(graphqlFileName).name;

    let fileTemplate = 
`resource "aws_cognito_user_pool" "pool" {
  name = "pool-${graphqlName + '_' + nowISOFormat}"
  password_policy {
    minimum_length = 6
    require_lowercase = false
    require_uppercase = false
    require_numbers = false
    require_symbols = false
  }
  auto_verified_attributes = ["email"]
  schema {
    name                     = "email"
    attribute_data_type      =  "String"
    developer_only_attribute = false
    mutable                  = true  # false for "sub"
    required                 = true # true for "sub"
    string_attribute_constraints {   # if it is a string
      min_length = 0                 # 10 for "birthdate"
      max_length = 2048              # 10 for "birthdate"
    }
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name = "client-${graphqlName + '_' + nowISOFormat}"

  user_pool_id = aws_cognito_user_pool.pool.id
  callback_urls = ["http://localhost:3000/callback", "http://localhost:4200"]
  logout_urls = ["http://localhost:3000"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  supported_identity_providers = ["COGNITO"]
  explicit_auth_flows = ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_CUSTOM_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "domain-${graphqlName + '_' + nowISOFormat}"
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "null_resource" "createUserUnconfirmed" {
  provisioner "local-exec" {
    command = "aws cognito-idp sign-up --region $AWS_DEFAULT_REGION --client-id \${aws_cognito_user_pool_client.client.id} --username admin@admin.fr --user-attributes Name=\\"email\\",Value=\\"admin@admin.fr\\" --password password"
    interpreter = ["bash", "-c"]  
  }
}

resource "null_resource" "confirmUserCreate" {
  depends_on = [null_resource.createUserUnconfirmed]
  provisioner "local-exec" {
    command = "aws cognito-idp admin-confirm-sign-up --region $AWS_DEFAULT_REGION --user-pool-id \${aws_cognito_user_pool.pool.id} --username admin@admin.fr"
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "getUserPool" {
  provisioner "local-exec" {
    command = "echo 'poolID: \${aws_cognito_user_pool.pool.id}\\n\\nclientID: \${aws_cognito_user_pool_client.client.id}' > ./cognito.txt;echo 'poolID: \${aws_cognito_user_pool.pool.id}\\n\\nclientID: \${aws_cognito_user_pool_client.client.id}\\n\\ndomain: \${aws_cognito_user_pool_domain.main.domain}' > ./front.txt"
    interpreter = ["bash", "-c"]
  }
}

resource "aws_api_gateway_authorizer" "authorizer" {
  name                   = "my-authorizer"
  type                   = "COGNITO_USER_POOLS"
  rest_api_id            = aws_api_gateway_rest_api.myAPI.id
  provider_arns          = [aws_cognito_user_pool.pool.arn]
}`;

// Create Service file
  _tree.create(
    `${projectName}/terraform/cognito.tf`,
    fileTemplate
  );
}