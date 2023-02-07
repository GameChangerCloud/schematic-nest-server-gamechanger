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

variable "ingress" {
  description = "Ingress rules"
  type = map(object({
    from_port                = number
    to_port                  = number
    protocol                 = optional(string)
    description              = optional(string)
    source_security_group_id = optional(string)
    cidr_blocks              = optional(list(string))
  }))
  nullable = false
  default  = {}
}

variable "egress" {
  description = "Egress rules"
  type = map(object({
    from_port                = number
    to_port                  = number
    protocol                 = optional(string)
    description              = optional(string)
    source_security_group_id = optional(string)
    cidr_blocks              = optional(list(string))
  }))
  nullable = false
  default  = {}
}

variable "vpc_id" {
  description = "ID of the pvc to attach security group"
  type        = string
  nullable    = false
}
