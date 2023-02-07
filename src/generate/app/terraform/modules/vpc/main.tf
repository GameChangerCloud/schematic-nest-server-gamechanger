resource "aws_vpc" "vpc" {
  enable_dns_hostnames = true
  enable_dns_support   = true
  cidr_block           = var.cidr_block

  tags = merge(
    { "Name" = "vpc-${var.graphql_name}-${var.timestamp}-${var.environment}" },
    var.tags
  )

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = cidrsubnet(var.cidr_block, 8, count.index + 1)
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    { "Name" = "subnet${count.index}-${var.graphql_name}-${var.timestamp}-${var.environment}" },
    var.tags
  )

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}


resource "aws_vpc_endpoint" "rds" {
  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.region}.rds"
  vpc_endpoint_type = "Interface"

  tags = merge(
    { "Name" = "endpoint-${var.graphql_name}-${var.timestamp}-${var.environment}" },
    var.tags
  )

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}
