import { Tree } from '@angular-devkit/schematics';
const path = require('path');

export function createIam(
    _tree: Tree,
    projectName: string,
    graphqlFileName: string,
) {
    const timeElapsed = Date.now();
    const nowISOFormat = new Date(timeElapsed).toISOString().slice(0, -5).replaceAll(':', '-').replace('T', 't');
    const graphqlName = path.parse(graphqlFileName).name;

    let fileTemplate = 
`data "aws_iam_policy_document" "example" {
    statement {
      effect    = "Allow"
      actions   = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
      ]
      resources = ["arn:aws:logs:*:*:*"]
    }
  
    statement  {
      effect    = "Allow"
      actions   = ["rds-data:*"]
      resources = ["*"]
    }
  
    statement {
      effect    = "Allow"
      actions   = ["secretsmanager:GetSecretValue"]
      resources = [aws_secretsmanager_secret.example.arn]
    }
  }
  
  
  resource "aws_iam_policy" "example" {
    name        = var.policy_name
    path        = "/"
    description = "Policy for ${graphqlName + '-' + nowISOFormat}"
    policy      = data.aws_iam_policy_document.example.json
  }
  
  resource "aws_iam_role" "instance" {
    name               = var.role_name
    description        = "Role for ${graphqlName + '-' + nowISOFormat}"
    assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
  }
  
  
  resource "aws_iam_role_policy_attachment" "test-attach" {
    role       = aws_iam_role.instance.name
    policy_arn = aws_iam_policy.example.arn
  }`;

// Create Service file
  _tree.create(
    `${projectName}/terraform/iam.tf`,
    fileTemplate
  );
}