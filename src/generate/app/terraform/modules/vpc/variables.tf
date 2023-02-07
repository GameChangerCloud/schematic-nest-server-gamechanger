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

variable "region" {
  description = "Target AWS region name"
  type        = string
  nullable    = false
  default     = "eu-west-1"
}

variable "tags" {
  description = "Tags for ressources"
  type        = map(any)
  nullable    = false
}

variable "cidr_block" {
  description = "CIDR block of vpc"
  type        = string
  nullable    = false
}

variable "availability_zones" {
  description = "All availability zone of current region"
  type        = list(string)
  nullable    = false
}
