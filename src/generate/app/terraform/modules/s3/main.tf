resource "aws_s3_bucket" "bucket" {
  bucket = "bucket-${var.graphql_name}-${var.timestamp}-${var.environment}"
}

resource "aws_s3_bucket_acl" "bucket" {
  bucket = aws_s3_bucket.bucket.id
  acl    = "private"
}
