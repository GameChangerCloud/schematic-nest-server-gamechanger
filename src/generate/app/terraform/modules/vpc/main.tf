resource "aws_vpc" "vpc" {
  enable_dns_hostnames = true
  enable_dns_support   = true
  cidr_block           = var.cidr_block

  tags = var.tags

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

  tags = var.tags

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}
