##################################################################
# Data sources to get VPC, subnets
##################################################################
data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "all" {
  vpc_id = data.aws_vpc.default.id
}





######################################
# Deploy RDS Instance
######################################
module "rds_aurora_postgresql"{
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "6.1.3"

 
  name              = var.rds_name
  engine            = "aurora-postgresql"
  engine_mode       = "serverless"
  engine_version    = "10.7"
  storage_encrypted = true

  vpc_id                = data.aws_vpc.default.id
  subnets               = data.aws_subnet_ids.all.ids
  create_security_group = true
  allowed_cidr_blocks   = []
  create_random_password = false

  database_name           = var.db_name
  master_username         = var.db_username
  master_password         = var.db_password

  monitoring_interval = 60

  backup_retention_period = 1
  apply_immediately   = true
  skip_final_snapshot = true
  enable_http_endpoint    = true

  db_parameter_group_name         = aws_db_parameter_group.postgresql.id
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.postgresql.id
  # enabled_cloudwatch_logs_exports = # NOT SUPPORTED

  scaling_configuration = {
    auto_pause               = true
    min_capacity             = 2
    max_capacity             = 16
    seconds_until_auto_pause = 300
    timeout_action           = "ForceApplyCapacityChange"
  }
}

resource "aws_db_parameter_group" "postgresql" {
  name        = "${var.rds_name}"
  family      = "aurora-postgresql10"
  description = "${var.rds_name}-aurora-db-postgres-parameter-group"
}

resource "aws_rds_cluster_parameter_group" "postgresql" {
  name        = "${var.cluster_db}"
  family      = "aurora-postgresql10"
  description = "${var.rds_name}-aurora-postgres-cluster-parameter-group"
}


