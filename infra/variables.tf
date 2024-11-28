variable "json_file_path" {
  description = "Path to the JSON file"
  type        = string
  default     = "/tmp/key.json"
}

variable "ssh_public_key" {
  description = "allowed public key to access vm"
  type        = string
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "europe-west1-b"
}

variable "machine_type" {
  description = "GCP machine type"
  type        = string
  default     = "e2-micro"
}

variable "instance_name" {
  description = "GCP backend snapshot"
  type        = string
  default     = "snapshot-iot-backend-v1"
}

variable "regional_ip_name" {
  description = "Name of the regional static IP"
  type        = string
  default     = "regional-ip-iot-backend"
}