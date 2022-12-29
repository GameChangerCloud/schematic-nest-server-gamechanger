import { Tree } from '@angular-devkit/schematics';
const path = require('path');

export function createApiGateway(
    _tree: Tree,
    projectName: string,
    graphqlFileName: string,
) {
    const timeElapsed = Date.now();
    const nowISOFormat = new Date(timeElapsed).toISOString().slice(0, -5).replaceAll(':', '-').replace('T', 't');
    const graphqlName = path.parse(graphqlFileName).name;

    let fileTemplate = 
`resource "aws_api_gateway_rest_api" "myAPI" {
  name        = var.api_name
  description = "This is my API for the ${graphqlName + '-' + nowISOFormat} project"
}

resource "aws_api_gateway_resource" "myResource" {
  rest_api_id = aws_api_gateway_rest_api.myAPI.id
  parent_id   = aws_api_gateway_rest_api.myAPI.root_resource_id
  path_part   = "graphql"
}

resource "aws_api_gateway_method" "myMethodGET" {
  rest_api_id   = aws_api_gateway_rest_api.myAPI.id
  resource_id   = aws_api_gateway_resource.myResource.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.authorizer.id
}


resource "aws_api_gateway_integration" "myIntegration" {
  rest_api_id = aws_api_gateway_rest_api.myAPI.id
  resource_id = aws_api_gateway_method.myMethodGET.resource_id
  http_method = aws_api_gateway_method.myMethodGET.http_method
  timeout_milliseconds = 29000

  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "myDeployement" {
  depends_on = [
    aws_api_gateway_integration.myIntegration]

  rest_api_id = aws_api_gateway_rest_api.myAPI.id
  stage_name  = "deploy"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_method_response" "myResponse200" {
  rest_api_id = aws_api_gateway_rest_api.myAPI.id
  resource_id = aws_api_gateway_resource.myResource.id
  http_method = aws_api_gateway_method.myMethodGET.http_method

  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true


  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "myIntegrationResponse" {
  depends_on = [aws_api_gateway_integration.myIntegration]

  rest_api_id = aws_api_gateway_rest_api.myAPI.id
  resource_id = aws_api_gateway_resource.myResource.id
  http_method = aws_api_gateway_method.myMethodGET.http_method
  status_code = aws_api_gateway_method_response.myResponse200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
  response_templates = {
    "application/json" = ""
  }
}


// OPTION PART. FOR SUPPORTING CORS
resource "aws_api_gateway_method" "typePathOptions" {
  rest_api_id   = aws_api_gateway_rest_api.myAPI.id
  resource_id   = aws_api_gateway_resource.myResource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}


resource "aws_api_gateway_method_response" "typeOptions200" {
  rest_api_id   = aws_api_gateway_rest_api.myAPI.id
  resource_id   = aws_api_gateway_resource.myResource.id
  http_method   = aws_api_gateway_method.typePathOptions.http_method
  status_code   = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration" "typeOptionsIntegration" {
  rest_api_id   = aws_api_gateway_rest_api.myAPI.id
  resource_id   = aws_api_gateway_resource.myResource.id
  http_method   = aws_api_gateway_method.typePathOptions.http_method
  type          = "MOCK"
  passthrough_behavior    = "WHEN_NO_TEMPLATES"
  request_templates = {
    "application/json" = "{\\"statusCode\\": 200}"
  }
}
resource "aws_api_gateway_integration_response" "typeOptionsIntegrationResponse" {
  rest_api_id   = aws_api_gateway_rest_api.myAPI.id
  resource_id   = aws_api_gateway_resource.myResource.id
  http_method   = aws_api_gateway_method.typePathOptions.http_method
  status_code   = aws_api_gateway_method_response.typeOptions200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Access-Control-Allow-Origin,X-Amz-Date,Authorization,X-Requested-With,X-Requested-By,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}


resource "null_resource" "getUrl" {
  provisioner "local-exec" {
    command = "echo '\${aws_api_gateway_deployment.myDeployement.invoke_url}/\${aws_api_gateway_resource.myResource.path_part}' > ./url.txt"
    interpreter = ["bash", "-c"]
  }
}`;

// Create Service file
  _tree.create(
    `${projectName}/terraform/apigateway.tf`,
    fileTemplate
  );
}