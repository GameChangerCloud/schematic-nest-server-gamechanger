resource "null_resource" "downsizing" {
  provisioner "local-exec" {
    working_dir = "${path.root}/.."
    command     = "npm prune --production"
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "nestbuild" {
  provisioner "local-exec" {
    working_dir = "${path.root}/.."
    command     = "nest build"
    interpreter = ["bash", "-c"]
  }
  depends_on = [
    null_resource.downsizing
  ]
}

data "archive_file" "init" {
  type        = "zip"
  source_dir  = "${path.root}/.."
  excludes    = ["terraform", ".aws-sam", "src"]
  output_path = "${path.root}/${var.s3_key}"
  depends_on = [
    null_resource.nestbuild
  ]
}

resource "aws_s3_bucket_object" "lambda" {
  key                    = var.s3_key
  bucket                 = var.s3_id
  source                 = "${path.root}/../${var.s3_key}"
  server_side_encryption = "aws:kms"
}


resource "aws_lambda_function" "lambda" {
  source_code_hash = data.archive_file.init.output_base64sha256
  function_name    = "lambda-${var.graphql_name}-${var.timestamp}-${var.environment}"
  description      = "Nest Gamechanger Lamdba"
  role             = var.iam_role_arn
  handler          = "dist/index.handler"
  runtime          = "nodejs18.x"
  memory_size      = 256
  timeout          = 60
  s3_bucket        = var.s3_bucket
  s3_key           = var.s3_key

  environment {
    variables = {
      DATABASE_DB       = var.rds_database_name
      DATABASE_USER     = var.rds_database_master_username
      DATABASE_PORT     = var.rds_database_port
      DATABASE_HOST     = var.rds_database_endpoint
      DATABASE_PASSWORD = var.rds_database_master_password
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }

  provisioner "local-exec" {
    command     = <<EOT
                rm -f final.yaml ../temp.yaml  
                ( echo "cat <<EOF > ../template.yaml";
                  cat ../template.yaml;
                ) >../temp.yaml
                . ../temp.yaml
              EOT
    interpreter = ["bash", "-c"]
  }

  depends_on = [
    null_resource.nestbuild,
    aws_s3_bucket_object.lambda
  ]

}

resource "aws_lambda_permission" "lambda_permission" {
  statement_id  = "AllowMyDemoAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${var.api_gateway_execution_arn}/*/*/*"
}

