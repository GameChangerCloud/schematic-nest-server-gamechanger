variable "environment" {
  description = "Target Environment name"
  type        = string
  nullable    = false
  default = "dev"
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

variable "region" {
  description = "Target AWS region name"
  type        = string
  nullable    = false
  default = "eu-west-1"
}

variable "db_username" {
  description = "Username for RDS database"
  type        = string
}

variable "db_password" {
  description = "Password for RDS database"
  type        = string
}
