variable "environment" {
  description = "Target Environment name"
  type        = string
  nullable    = false
}

variable "graphql_name" {
  description = "Name of the graphql file"
  type        = string
  nullable    = false
}

variable "timestamp" {
  description = "Current timestamp formated by GameChanger engine"
  type        = string
  nullable    = false
}

variable "tags" {
  description = "Tags for ressources"
  type        = map(any)
  nullable    = false
}

variable "s3_bucket" {
  description = "S3 bucket name"
  type        = string
  nullable    = false
}

variable "s3_key" {
  description = "S3 bucket key"
  type        = string
  default     = "lambda.zip"
}

variable "rds_database_name" {
  description = "Name of the RDS database name"
  type        = string
  nullable    = false
}

variable "rds_database_port" {
  description = "RDS database port"
  type        = string
  nullable    = false
}

variable "rds_database_endpoint" {
  description = "RDS endpoint"
  type        = string
  nullable    = false
}

variable "rds_database_master_username" {
  description = "Name of the RDS master user"
  type        = string
  nullable    = false
}

variable "rds_database_master_password" {
  description = "Password of the RDS master user"
  type        = string
  nullable    = false
}

variable "subnet_ids" {
  description = "Ids of the subnetx"
  type        = list(string)
  nullable    = false
}

variable "security_group_ids" {
  description = "Ids of lambda security group"
  type        = list(string)
  nullable    = false
}

variable "iam_role_arn" {
  description = "ARN of iam role"
  type        = string
  nullable    = false
}

variable "api_gateway_execution_arn" {
  description = "ARN of the api gateway execution"
  type        = string
  nullable    = false
}
