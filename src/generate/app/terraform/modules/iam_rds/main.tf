data "aws_iam_policy_document" "rds" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["rds-data:*"]
    resources = ["*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["rds-db:connect"]
    resources = ["*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
      "secretsmanager:ListSecretVersionIds"
    ]
    resources = [var.aws_secrets]
  }

  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetRandomPassword",
      "secretsmanager:ListSecrets"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "main" {
  name        = "policy-${var.name}-${var.graphql_name}-${var.timestamp}-${var.environment}"
  path        = "/"
  description = "Policy for ${var.graphql_name}-${var.timestamp}"
  policy      = data.aws_iam_policy_document.rds.json

  tags = var.tags
}

resource "aws_iam_role" "main" {
  name               = "role-${var.name}-${var.graphql_name}-${var.timestamp}-${var.environment}"
  description        = "Role for ${var.graphql_name}-${var.timestamp}"
  assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "rds.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF

  tags = var.tags

  # Only use for Ippon AWS sandbox
  lifecycle {
    ignore_changes = [tags, tags_all]
  }
}


resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.main.name
  policy_arn = aws_iam_policy.main.arn
}
