terraform {
  backend "gcs" {
    bucket = "iot-backend-bucket-new"
    prefix = "terraform/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.7"
    }
  }
}

data "google_compute_address" "regional_ip" {
  name   = var.regional_ip_name
  region = var.region
}

# Data source to reference the custom backend image
data "google_compute_image" "custom_image" {
  name    = var.instance_name
  project = var.project_id
}

resource "google_compute_instance" "backend_instance" {
  name         = "backend-vm"
  machine_type = var.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = data.google_compute_image.custom_image.self_link
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = data.google_compute_address.regional_ip.address
    }
  }

  metadata_startup_script = file("${path.module}/startup-script.sh")

  metadata = {
    ssh-keys = "debian:${var.ssh_public_key}"
  }

  tags = ["backend"]
}

resource "google_compute_firewall" "allow_backend_http" {
  name    = "allow-backend-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["backend"]
}

resource "google_compute_firewall" "allow_database" {
  name    = "allow-database-access"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }

  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["backend"]
}

resource "google_compute_firewall" "allow_backend" {
  name    = "allow-backend-access"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["4000"]
  }

  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["backend"]
}