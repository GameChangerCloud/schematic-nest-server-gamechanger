resource "random_id" "server" {
  byte_length = 8
}

resource "aws_secretsmanager_secret" "example" {
  name = "${var.secret_name}-${random_id.server.b64_url}"
}

resource "aws_secretsmanager_secret_version" "example" {
  secret_id     = aws_secretsmanager_secret.example.id
  secret_string = "{\"username\":\"${var.db_username}\",\"password\":\"${var.db_password}\"}"
}