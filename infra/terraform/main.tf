terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

locals {
  lambda_environment = merge(
    {
      NODE_ENV = var.lambda_node_env
    },
    var.lambda_environment
  )

  project_prefix = var.project_name
}

data "archive_file" "gateway" {
  type        = "zip"
  output_path = "${path.module}/build/lambda.zip"

  source {
    content  = file("${path.module}/../../dist/lambda.mjs")
    filename = "lambda.mjs"
  }

  source {
    content  = file("${path.module}/../../dist/index.js")
    filename = "index.js"
  }

  source {
    content  = jsonencode({ type = "module" })
    filename = "package.json"
  }
}

resource "aws_iam_role" "lambda" {
  name = "${local.project_prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "gateway" {
  function_name = var.lambda_function_name
  description   = var.lambda_description
  role          = aws_iam_role.lambda.arn
  filename      = data.archive_file.gateway.output_path
  handler       = var.lambda_handler
  runtime       = var.lambda_runtime
  architectures = [var.lambda_architecture]
  memory_size   = var.lambda_memory_size
  timeout       = var.lambda_timeout
  publish       = true

  environment {
    variables = local.lambda_environment
  }

  source_code_hash = data.archive_file.gateway.output_base64sha256

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "gateway" {
  name              = "/aws/lambda/${aws_lambda_function.gateway.function_name}"
  retention_in_days = var.log_retention_in_days
  tags              = var.tags
}

resource "aws_apigatewayv2_api" "gateway" {
  name          = "${local.project_prefix}-http"
  protocol_type = "HTTP"

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.gateway.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.gateway.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
  api_id = aws_apigatewayv2_api.gateway.id
  route_key = "$default"
  target   = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.gateway.id
  name        = var.api_stage_name
  auto_deploy = true
  tags        = var.tags
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.gateway.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.gateway.execution_arn}/*/*"
}

output "lambda_function_name" {
  value       = aws_lambda_function.gateway.function_name
  description = "Name of the Lambda function"
}

output "api_endpoint" {
  value       = aws_apigatewayv2_stage.default.invoke_url
  description = "Invoke URL for the HTTP API"
}

output "lambda_invoke_arn" {
  value       = aws_lambda_function.gateway.invoke_arn
  description = "Invoke ARN of the Lambda function"
}
