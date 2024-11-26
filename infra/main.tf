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

    # Définir le répertoire du projet et se déplacer dedans
    REPO_DIR="/home/ubuntu/IoT_Backend/"
    cd "$REPO_DIR/database"

    # Construire l'image Docker
    sudo docker build -t my-postgres-db .

    # Lancer le conteneur Docker
    sudo docker run -d -p 5432:5432 my-postgres-db

    cd "$REPO_DIR/backend"

    # Construire l'image Docker
    sudo docker build -t node-backend .

    # Lancer le conteneur Docker
    docker run -d -p 3000:3000 node-backend
  EOF

  tags         = ["backend"]
}

resource "google_compute_firewall" "allow_backend_http" {
  name    = "allow-backend-http"
  network = "default" # Remplacez par le nom de votre réseau VPC si différent

  allow {
    protocol = "tcp"
    ports    = ["80", "443"] # Autoriser HTTP et HTTPS
  }

  direction = "INGRESS"
  source_ranges = ["0.0.0.0/0"] # Permet l'accès depuis n'importe quelle IP
  target_tags   = ["backend"]  # Appliquez cette règle uniquement aux instances avec ce tag
}

resource "google_compute_firewall" "allow_database" {
  name    = "allow-database-access"
  network = "default" # Remplacez par le nom de votre réseau VPC si différent

  allow {
    protocol = "tcp"
    ports    = ["5432"] # Port par défaut de PostgreSQL
  }

  direction = "INGRESS"
  source_ranges = ["192.168.1.0/24"] # Remplacez par les plages IP autorisées
  target_tags   = ["backend"] # Appliquez cette règle uniquement aux instances avec ce tag
}
