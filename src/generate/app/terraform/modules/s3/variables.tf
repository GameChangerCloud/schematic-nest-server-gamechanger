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
