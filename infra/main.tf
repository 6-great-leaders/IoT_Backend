resource "google_compute_instance" "backend_instance" {
  name         = "backend-vm"
  machine_type = "e2-micro"  # Choose the instance type based on your requirements
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network       = "default"
    access_config {}  # This enables external IP for the instance
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    sudo apt update
    sudo apt install -y docker.io
    sudo docker run -d -p 80:3000 YOUR_IMAGE  # Replace YOUR_IMAGE with your Docker image
  EOF
}
