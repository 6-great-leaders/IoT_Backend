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
  EOF
}
