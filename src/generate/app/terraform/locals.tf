locals {
  tags = {
    Environment = upper(var.environment)
    Owner       = "terrafomr-gamechanger"
    Project     = "${var.graphql_name}-${var.timestamp}"
    CreatedAt   = formatdate("DD MMM YYYY hh:mm ZZZ", timestamp())
  }
}
