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

resource "google_compute_instance" "backend_instance" {
  name         = "backend-vm"
  machine_type = var.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network       = "default"
    access_config {}
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash

    # Mettre à jour les paquets et installer Docker
    sudo apt update
    sudo apt install -y docker.io

    # Cloning github backend repository
    git clone https://github.com/6-great-leaders/IoT_Backend.git

    # To remove when merged into main
    git switch feature-512-deploy-backend

    # Définir le répertoire du projet et se déplacer dedans
    REPO_DIR="/home/debian/IoT_Backend/"
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

  metadata = {
    ssh-keys = "debian:${var.ssh_public_key}"
  }

  tags         = ["backend"]
}

resource "google_compute_firewall" "allow_backend_http" {
  name    = "allow-backend-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  direction = "INGRESS"
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

  direction = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["backend"]
}
