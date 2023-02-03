resource "aws_db_subnet_group" "postgresql" {
  name       = "sngrp-${var.graphql_name}-${var.timestamp}-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_rds_cluster" "postgresql" {
  cluster_identifier      = "aurora-db-${var.graphql_name}-${var.timestamp}-${var.environment}"
  engine                  = "aurora-postgresql"
  engine_mode             = var.engine_mode
  engine_version          = var.engine_version
  availability_zones      = var.availability_zones
  database_name           = replace("db-${var.graphql_name}-${var.timestamp}-${var.environment}", "-", "")
  master_username         = var.db_username
  master_password         = var.db_password
  backup_retention_period = 1
  storage_encrypted       = true
  skip_final_snapshot     = true
  db_subnet_group_name    = "sngrp-${var.graphql_name}-${var.timestamp}-${var.environment}"
  vpc_security_group_ids  = var.security_group_ids

  serverlessv2_scaling_configuration {
    min_capacity = 1
    max_capacity = 16
  }

  tags = var.tags

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }

  depends_on = [
    aws_db_subnet_group.postgresql
  ]
}

resource "aws_rds_cluster_instance" "postgresql" {
  cluster_identifier   = aws_rds_cluster.postgresql.id
  instance_class       = "db.serverless"
  identifier           = "db-${var.graphql_name}-${var.timestamp}-${var.environment}"
  engine               = "aurora-postgresql"
  engine_version       = "14.6"
  db_subnet_group_name = "sngrp-${var.graphql_name}-${var.timestamp}-${var.environment}"
  debug_logging        = true
  require_tls          = false

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}

resource "aws_db_parameter_group" "postgresql" {
  name        = "db-${var.graphql_name}-${var.timestamp}-${var.environment}"
  family      = "aurora-postgresql14"
  description = "parameter-group-${var.graphql_name}-${var.timestamp}-${var.environment}"
}

resource "aws_rds_cluster_parameter_group" "postgresql" {
  name        = "db-${var.graphql_name}-${var.timestamp}-${var.environment}"
  family      = "aurora-postgresql14"
  description = "cluster-parameter-group-${var.graphql_name}-${var.timestamp}-${var.environment}"
}

# Proxy
resource "aws_db_proxy" "postgresql" {
  count                  = var.use_proxy ? 1 : 0
  name                   = "db-${var.graphql_name}-${var.timestamp}-${var.environment}"
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = var.iam_role_arn
  vpc_security_group_ids = var.security_group_ids
  vpc_subnet_ids         = var.subnet_ids

  auth {
    description = "Disbaled IAM auth and use login password for authentification"
    auth_scheme = "SECRETS"
    iam_auth    = "DISABLED"
    secret_arn  = var.secret_arn
  }

  tags = var.tags

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}

resource "aws_db_proxy_default_target_group" "postgresql" {
  count         = var.use_proxy ? 1 : 0
  db_proxy_name = aws_db_proxy.postgresql.0.name

  connection_pool_config {
    connection_borrow_timeout = 120
    max_connections_percent   = 100
  }
}

resource "aws_db_proxy_target" "postgresql" {
  count                 = var.use_proxy ? 1 : 0
  db_cluster_identifier = aws_rds_cluster.postgresql.id
  db_proxy_name         = aws_db_proxy.postgresql.0.name
  target_group_name     = aws_db_proxy_default_target_group.postgresql.0.name
}
