resource "aws_s3_bucket" "bucket" {
  bucket = "server-gamechanger"
  acl    = "private"
}

resource "aws_s3_bucket_acl" "bucket" {
  bucket = aws_s3_bucket.bucket.id
  acl    = "private"
}


resource "aws_s3_object" "lambda" {
  key                    = "lambda.zip"
  bucket                 = aws_s3_bucket.bucket.id
  source                 = data.archive_file.init.output_path
  server_side_encryption = "aws:kms"
}
