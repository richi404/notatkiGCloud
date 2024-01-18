variable "credentials_file" {
  description = "Path to the Google Cloud credentials JSON file"
  default     = "credentials.json"
}

variable "project_id" {
  description = "Google Cloud Project ID"
  default     = "golden-index-410209"
}

variable "region" {
  description = "Google Cloud region"
  default     = "europe-west1"
}

variable "zone" {
  description = "Google Cloud zone"
  default     = "europe-west1-b"
}

variable "nodejs_app_image" {
  description = "Docker image for the Node.js app"
  default     = "europe-west1-docker.pkg.dev/golden-index-410209/projektsabre/nodejs-app:latest"
}

variable "reactjs_app_image" {
  description = "Docker image for the React.js app"
  default     = "europe-west1-docker.pkg.dev/golden-index-410209/projektsabre/reactjs-app:latest"
}

variable "database_name" {
  description = "Name of cloud sql instance"
  default = "notes-sql-database"
}