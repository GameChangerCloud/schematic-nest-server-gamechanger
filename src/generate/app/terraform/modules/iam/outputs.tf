output "role_arn" {
  value = aws_iam_role.main.arn
}

output "role_id" {
  value = aws_iam_role.main.id
}

output "policy_arn" {
  value = aws_iam_policy.main.arn
}

output "policy_id" {
  value = aws_iam_policy.main.id
}
