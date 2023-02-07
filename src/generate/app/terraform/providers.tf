terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.5.1, < 5.0.0",
    }
  }
}


provider "aws" {
  profile = "default"
  alias   = "default"
}
