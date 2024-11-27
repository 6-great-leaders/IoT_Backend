terraform {
  backend "gcs" {
    bucket = "iot-backend-bucket"
    prefix = "terraform/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.7"
    }
  }
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
    access_config {}
  }

  metadata = {
    ssh-keys = "debian:${var.ssh_public_key}"
    startup_script = <<-EOF
      #!/bin/bash

      # Mettre à jour les paquets et installer Docker
      sudo apt update

      # Définir le répertoire du projet et se déplacer dedans
      REPO_DIR="/home/debian/IoT_Backend/"
      cd "$REPO_DIR"

      # To remove before merging into main !!
      git switch feature-512-deploy-backend

      # Pulling github backend repository
      git pull

      # Make sure container doesn't block ports
      sudo docker container prune --force

      cd "$REPO_DIR/database"
      # Construire l'image Docker
      sudo docker build -t my-postgres-db .

      # Lancer le conteneur Docker
      sudo docker run -d -p 5432:5432 my-postgres-db

      cd "$REPO_DIR/backend"

      # Construire l'image Docker
      sudo docker build -t node-backend .

      # Lancer le conteneur Docker
      sudo docker run -d -p 3000:3000 node-backend
    EOF
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
    ports    = ["3000"]
  }

  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["backend"]
}