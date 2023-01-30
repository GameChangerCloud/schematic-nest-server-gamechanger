######################################################
################### DOCUMENTATION ####################
######################################################
# Main file to create all Game Changer infrastructure
# All the ressources must be deployed in eu-west-1

######################################################
############ RESSOURCES and DATA SOURCES #############
######################################################

data "aws_availability_zones" "available_zones" {
  filter {
    name   = "region-name"
    values = [var.region]
  }
}

resource "random_id" "server" {
  byte_length = 8
}

resource "aws_secretsmanager_secret" "postgresql" {
  name = "secret-${var.graphql_name}-${var.timestamp}-${var.environment}-${random_id.server.b64_url}"
}

resource "aws_secretsmanager_secret_version" "postgresql" {
  secret_id     = aws_secretsmanager_secret.postgresql.id
  secret_string = "{\"username\":\"${var.db_username}\",\"password\":\"${var.db_password}\"}"
}


######################################################
###################### MODULES #######################
######################################################
module "s3" {
  source = "./modules/s3"

  environment  = var.environment
  graphql_name = var.graphql_name
  timestamp    = var.timestamp

  tags = local.tags
}

module "cognito" {
  source = "./modules/cognito"

  environment  = var.environment
  graphql_name = var.graphql_name
  timestamp    = var.timestamp

  tags = local.tags
}

module "api_gateway" {
  source = "./modules/api_gateway"

  cognito_arn       = module.cognito.arn
  lambda_invoke_arn = module.lambda.invoke_arn

  environment  = var.environment
  graphql_name = var.graphql_name
  timestamp    = var.timestamp

  tags = local.tags
}

module "vpc" {
  source = "./modules/vpc"

  environment        = var.environment
  graphql_name       = var.graphql_name
  timestamp          = var.timestamp
  region             = var.region
  availability_zones = data.aws_availability_zones.available_zones.names
  cidr_block         = "172.31.0.0/16"

  tags = local.tags
}

module "sg_rds" {
  source = "./modules/security_group"

  environment  = var.environment
  graphql_name = "${var.graphql_name}-rds"
  timestamp    = var.timestamp
  vpc_id       = module.vpc.id
  ingress = {
    "rdsToLambda" = {
      from_port                = 0
      to_port                  = 5432
      protocol                 = "TCP"
      source_security_group_id = module.sg_lambda.id
      description              = "Allow lambda to communicate to RDS"
    }
  }
  egress = {
    "rdsToLambda" = {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      description = "Allow lambda to communicate to RDS"
    }
  }

  tags = local.tags
}

module "sg_lambda" {
  source = "./modules/security_group"

  environment  = var.environment
  graphql_name = "${var.graphql_name}-lambda"
  timestamp    = var.timestamp
  vpc_id       = module.vpc.id
  egress = {
    "lambdaToAll" = {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      description = "Allow lambda to communicate over VPC"
    }
  }

  tags = local.tags
}

module "iam" {
  source = "./modules/iam"

  environment  = var.environment
  graphql_name = var.graphql_name
  timestamp    = var.timestamp
  aws_secrets  = aws_secretsmanager_secret.postgresql.arn

  tags = local.tags
}

module "rds" {
  source = "./modules/rds-aurora-postgresql"

  subnet_ids         = module.vpc.subnet_ids
  security_group_ids = [module.sg_rds.id]
  iam_role_arn       = module.iam.role_arn

  environment        = var.environment
  graphql_name       = var.graphql_name
  timestamp          = var.timestamp
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = "14.6"
  use_proxy          = true
  db_username        = var.db_username
  db_password        = var.db_password
  availability_zones = data.aws_availability_zones.available_zones.names
  secret_arn         = aws_secretsmanager_secret.postgresql.arn

  tags = local.tags
}


module "lambda" {
  source = "./modules/lambda"
  providers = {
    aws = aws.default
  }

  s3_bucket                    = module.s3.bucket
  subnet_ids                   = toset(module.vpc.subnet_ids)
  security_group_ids           = [module.sg_lambda.id]
  iam_role_arn                 = module.iam.role_arn
  rds_database_name            = module.rds.cluster_database_name
  rds_database_port            = module.rds.cluster_port
  rds_database_endpoint        = module.rds.cluster_proxy_endpoint
  rds_database_master_username = module.rds.cluster_master_username
  rds_database_master_password = module.rds.cluster_master_password
  api_gateway_execution_arn    = module.api_gateway.execution_arn

  environment  = var.environment
  graphql_name = var.graphql_name
  timestamp    = var.timestamp

  tags = local.tags
}
