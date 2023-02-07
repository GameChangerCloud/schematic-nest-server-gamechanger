output "id" {
  value = aws_vpc.vpc.id
}

output "arn" {
  value = aws_vpc.vpc.arn
}

output "subnet_ids" {
  value = aws_subnet.private.*.id
}
