resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.environment}-api-${var.graphql_name}-${var.timestamp}"
  description = "This is my API for the ${var.graphql_name}-${var.timestamp} project"

  tags = var.tags
}

resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "graphql"
}

resource "aws_api_gateway_method" "method_get" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.authorizer.id
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id          = aws_api_gateway_rest_api.api.id
  resource_id          = aws_api_gateway_method.method_get.resource_id
  http_method          = aws_api_gateway_method.method_get.http_method
  timeout_milliseconds = 29000

  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = var.lambda_invoke_arn
}

resource "aws_api_gateway_deployment" "deployement" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = "deploy"

  depends_on = [
    aws_api_gateway_integration.integration
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api.id
  http_method = aws_api_gateway_method.method_get.http_method

  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "response" {
  depends_on = [aws_api_gateway_integration.integration]

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api.id
  http_method = aws_api_gateway_method.method_get.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
  response_templates = {
    "application/json" = ""
  }
}

// OPTION PART. FOR SUPPORTING CORS
resource "aws_api_gateway_method" "type_path_option" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "type_option_200" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api.id
  http_method = aws_api_gateway_method.type_path_option.http_method
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "type_options_integration" {
  rest_api_id          = aws_api_gateway_rest_api.api.id
  resource_id          = aws_api_gateway_resource.api.id
  http_method          = aws_api_gateway_method.type_path_option.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_TEMPLATES"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "type_option_response" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api.id
  http_method = aws_api_gateway_method.type_path_option.http_method
  status_code = aws_api_gateway_method_response.type_option_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Access-Control-Allow-Origin,X-Amz-Date,Authorization,X-Requested-With,X-Requested-By,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_authorizer" "authorizer" {
  name          = "my-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  provider_arns = [var.cognito_arn]
}

resource "null_resource" "getUrl" {
  provisioner "local-exec" {
    command     = "echo '${aws_api_gateway_deployment.deployement.invoke_url}${aws_api_gateway_resource.api.path_part}' > ./url.txt"
    interpreter = ["bash", "-c"]
  }
}

