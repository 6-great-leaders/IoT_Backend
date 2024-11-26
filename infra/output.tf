output "backend_external_ip" {
  description = "Adresse IP externe de la VM du backend"
  value       = google_compute_instance.backend_instance.network_interface[0].access_config[0].nat_ip
}
