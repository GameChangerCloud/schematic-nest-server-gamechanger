output "arn" {
  description = "Lamdba ARN"
  value       = aws_lambda_function.lambda.arn
}

output "id" {
  description = "Lambda Id"
  value       = aws_lambda_function.lambda.id
}

output "invoke_arn" {
  description = "Lambda invoke ARN"
  value       = aws_lambda_function.lambda.invoke_arn
}
