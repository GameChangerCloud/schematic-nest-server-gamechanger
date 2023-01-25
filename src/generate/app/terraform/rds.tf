##################################################################
# Data sources to get VPC, subnets
##################################################################
data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "all" {
  vpc_id = data.aws_vpc.default.id
}

output "aws_subnet_ids" {
  value = data.aws_subnet_ids.all
}


######################################
# Deploy RDS Instance
######################################
module "rds_aurora_postgresql" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "7.5.1"

  name           = var.rds_name
  engine         = "aurora-postgresql"
  engine_mode    = "provisioned"
  engine_version = "14.6" # Currently latest. Default version is 13.6

  storage_encrypted = true

  vpc_id                 = data.aws_vpc.default.id
  subnets                = data.aws_subnet_ids.all.ids
  create_security_group  = true
  allowed_cidr_blocks    = []
  create_random_password = false

  database_name   = var.db_name
  master_username = var.db_username
  master_password = var.db_password

  monitoring_interval = 60

  backup_retention_period = 1
  apply_immediately       = true
  skip_final_snapshot     = true
  enable_http_endpoint    = true

  db_parameter_group_name         = aws_db_parameter_group.postgresql.id
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.postgresql.id
  # enabled_cloudwatch_logs_exports = # NOT SUPPORTED

  serverlessv2_scaling_configuration = {
    min_capacity = 1
    max_capacity = 16
  }

  tags = {
    "owner" : "terraform-gamechanger"
  }
}

resource "aws_rds_cluster_instance" "postgresql" {
  cluster_identifier = module.rds_aurora_postgresql.cluster_id
  instance_class     = "db.serverless"
  identifier         = var.rds_name
  engine             = "aurora-postgresql"
  engine_version     = "14.6"
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}

resource "aws_db_parameter_group" "postgresql" {
  name        = var.rds_name
  family      = "aurora-postgresql14"
  description = "${var.rds_name}-aurora-db-postgres-parameter-group"
}

resource "aws_rds_cluster_parameter_group" "postgresql" {
  name        = var.cluster_db
  family      = "aurora-postgresql14"
  description = "${var.rds_name}-aurora-postgres-cluster-parameter-group"
}


# Proxy
resource "aws_db_proxy" "postgresql" {
  name                   = var.cluster_db
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = aws_iam_role.instance.arn
  vpc_security_group_ids = [module.rds_aurora_postgresql.security_group_id]
  vpc_subnet_ids         = toset(data.aws_subnet_ids.all.ids)

  auth {
    auth_scheme = "SECRETS"
    description = "example"
    iam_auth    = "REQUIRED"
    secret_arn  = aws_secretsmanager_secret.example.arn
  }

  tags = {
    "owner" : "terraform-gamechanger"
  }
}

resource "aws_db_proxy_default_target_group" "postgresql" {
  db_proxy_name = aws_db_proxy.postgresql.name

  connection_pool_config {
    connection_borrow_timeout = 120
    max_connections_percent   = 100
  }
}

resource "aws_db_proxy_target" "postgresql" {
  db_cluster_identifier = module.rds_aurora_postgresql.cluster_id
  db_proxy_name         = aws_db_proxy.postgresql.name
  target_group_name     = aws_db_proxy_default_target_group.postgresql.name
}
