output "backend_vm_external_ip" {
  value = google_compute_instance.backend_instance.network_interface[0].access_config[0].nat_ip
}
