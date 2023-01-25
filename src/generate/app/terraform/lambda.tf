resource "null_resource" "downsizing" {
  provisioner "local-exec" {
    working_dir = "${path.module}/.."
    command     = "npm prune --production"
    interpreter = ["bash", "-c"]
  }
}

resource "null_resource" "nestbuild" {
  provisioner "local-exec" {
    working_dir = "${path.module}/.."
    command     = "nest build"
    interpreter = ["bash", "-c"]
  }
  depends_on = [
    null_resource.downsizing
  ]
}

data "archive_file" "init" {
  type        = "zip"
  source_dir  = "${path.module}/.."
  excludes    = ["terraform", ".aws-sam", "src"]
  output_path = "${path.module}/lambda.zip"
  depends_on = [
    null_resource.nestbuild
  ]
}


resource "aws_lambda_function" "lambda" {
  source_code_hash = data.archive_file.init.output_base64sha256
  function_name    = var.lambda_name
  description      = "Nest Gamechanger Lamdba"
  role             = aws_iam_role.instance.arn
  handler          = "dist/index.handler"
  runtime          = "nodejs18.x"
  memory_size      = 256
  timeout          = 60
  s3_bucket        = aws_s3_bucket.bucket.bucket
  s3_key           = "lambda.zip"

  environment {
    variables = {
      DATABASE_DB       = module.rds_aurora_postgresql.cluster_database_name
      DATABASE_USER     = module.rds_aurora_postgresql.cluster_master_username
      DATABASE_PORT     = module.rds_aurora_postgresql.cluster_port
      DATABASE_HOST     = module.rds_aurora_postgresql.cluster_endpoint
      DATABASE_PASSWORD = module.rds_aurora_postgresql.cluster_master_password
    }
  }

  provisioner "local-exec" {
    command     = <<EOT
                export arn=${module.rds_aurora_postgresql.cluster_arn}
                export secretArn=${aws_secretsmanager_secret.example.arn}
                rm -f final.yaml ../temp.yaml  
                ( echo "cat <<EOF > ../template.yaml";
                  cat ../template.yaml;
                ) >../temp.yaml
                . ../temp.yaml
              EOT
    interpreter = ["bash", "-c"]
  }
  depends_on = [
    null_resource.nestbuild
  ]

}

resource "aws_lambda_permission" "lambda_permission" {
  depends_on    = [aws_api_gateway_deployment.myDeployement]
  statement_id  = "AllowMyDemoAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.myAPI.execution_arn}/*/*/*"
}

