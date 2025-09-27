variable "aws_region" {
  description = "AWS region to deploy the infrastructure"
  type        = string
}

variable "aws_profile" {
  description = "Optional named AWS CLI profile to use"
  type        = string
  default     = null
}

variable "project_name" {
  description = "Prefix used to name AWS resources"
  type        = string
  default     = "assembleo-gateway"
}

variable "lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "assembleo-api-gateway"
}

variable "lambda_description" {
  description = "Description for the Lambda function"
  type        = string
  default     = "Assembleo API Gateway built with Hono"
}

variable "lambda_handler" {
  description = "Lambda handler entrypoint"
  type        = string
  default     = "lambda.handler"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs20.x"
}

variable "lambda_architecture" {
  description = "Lambda architecture (arm64 or x86_64)"
  type        = string
  default     = "arm64"
  validation {
    condition     = contains(["arm64", "x86_64"], var.lambda_architecture)
    error_message = "lambda_architecture must be either 'arm64' or 'x86_64'."
  }
}

variable "lambda_memory_size" {
  description = "Memory allocated to the Lambda function (MB)"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Timeout for the Lambda function (seconds)"
  type        = number
  default     = 15
}

variable "lambda_node_env" {
  description = "NODE_ENV value injected into the Lambda environment"
  type        = string
  default     = "production"
}

variable "lambda_environment" {
  description = "Additional environment variables for the Lambda function"
  type        = map(string)
  default     = {}
}

variable "api_stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "$default"
}

variable "log_retention_in_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
