provider "aws" {
  region     = "us-east-1"
  access_key = "AKIAXXXFAKEKEYXXX"
  secret_key = "fakeSecretKey123"
}

resource "aws_s3_bucket" "example" {
  bucket = "example-vulnerable-bucket"
  acl    = "public-read" # Public ACL is often flagged as a security issue

  tags = {
    Name        = "example-vulnerable-bucket"
    Environment = "Test"
  }
}