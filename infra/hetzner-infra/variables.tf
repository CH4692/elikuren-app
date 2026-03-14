variable "ssh_public_key" {
  type = string
}


variable "ssh_allowed_ips" {
  type = list(string)
  # Default offen, aber in tfvars solltest du das einschränken!
  default = ["0.0.0.0/0", "::/0"]
}

variable "location" {
  type    = string
  default = "nbg1"
}

variable "server_type_prod" {
  type    = string
  default = "cax11"
}

variable "server_type_dev" {
  type    = string
  default = "cax11"
}

variable "image" {
  type    = string
  default = "ubuntu-24.04"
}

variable "tailscale_authkey_dev" {
  type      = string
  sensitive = true
}

variable "tailscale_authkey_prod" {
  type      = string
  sensitive = true
}

variable "acme_email" {
  type = string
}

variable "github_owner" {
  type = string
}

variable "prod_web_host" {
  type = string
}

variable "prod_api_host" {
  type = string
}

variable "dev_web_host" {
  type = string
}

variable "dev_api_host" {
  type = string
}

variable "traefik_dashboard_host_prod" {
  type = string
}

variable "traefik_dashboard_host_dev" {
  type = string
}

variable "ghcr_username" {
  type = string
}

variable "ghcr_token" {
  type      = string
  sensitive = true
}
