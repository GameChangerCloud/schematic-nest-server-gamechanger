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

variable "engine" {
  description = "Engine type"
  type        = string
  nullable    = false
}

variable "engine_mode" {
  description = "Engine mode"
  type        = string
  nullable    = false
}

variable "engine_version" {
  description = "Engine verison"
  type        = string
}

variable "db_username" {
  description = "Master username of rds db"
  type        = string
  nullable    = false
}

variable "db_password" {
  description = "Master password of rds db"
  type        = string
  nullable    = false
}

variable "use_proxy" {
  description = "Enable proxy and create proxy ressources"
  type        = bool
  default     = false
}

variable "availability_zones" {
  description = "All availability zone of current region"
  type        = list(string)
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

variable "secret_arn" {
  description = "DB proxy secret arn"
  type        = string
  nullable    = true
}
