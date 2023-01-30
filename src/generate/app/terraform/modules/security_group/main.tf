resource "aws_security_group" "sg" {
  name   = replace("sg-${var.graphql_name}-${var.timestamp}-${var.environment}", "-", "")
  vpc_id = var.vpc_id

  tags = var.tags

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}


resource "aws_security_group_rule" "ingress" {
  for_each                 = var.ingress
  type                     = "ingress"
  security_group_id        = aws_security_group.sg.id
  source_security_group_id = each.value.source_security_group_id != null ? each.value.source_security_group_id : aws_security_group.sg.id
  from_port                = each.value.from_port
  to_port                  = each.value.to_port
  protocol                 = each.value.protocol
  description              = each.value.description
}


resource "aws_security_group_rule" "egress" {
  for_each                 = var.egress
  type                     = "egress"
  security_group_id        = aws_security_group.sg.id
  source_security_group_id = each.value.source_security_group_id != null ? each.value.source_security_group_id : aws_security_group.sg.id
  from_port                = each.value.from_port
  to_port                  = each.value.to_port
  protocol                 = each.value.protocol
  description              = each.value.description
}
