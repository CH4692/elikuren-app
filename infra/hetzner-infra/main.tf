terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.48"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "hcloud" {}

resource "hcloud_ssh_key" "mac" {
  name       = "mac-main"
  public_key = var.ssh_public_key
}

resource "tls_private_key" "dev_deploy" {
  algorithm = "ED25519"
}

resource "tls_private_key" "prod_deploy" {
  algorithm = "ED25519"
}

resource "hcloud_firewall" "prod_web" {
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "22"
    source_ips = [
      "100.64.0.0/10"
    ]
  }
  name = "prod-firewall"
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

resource "hcloud_firewall" "dev_web" {
  name = "dev-firewall"
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "22"
    source_ips = [
      "100.64.0.0/10"
    ]
  }
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

locals {

  ghcr_auth = base64encode("${var.ghcr_username}:${var.ghcr_token}")

  cloudinit_prod = templatefile("${path.module}/cloudinit.yaml.tftpl", {
    deploy_public_key      = trimspace(tls_private_key.prod_deploy.public_key_openssh)
    tailscale_authkey      = var.tailscale_authkey_prod
    hostname               = "prod-1"
    acme_email             = var.acme_email
    traefik_dashboard_host = var.traefik_dashboard_host_prod
    github_owner           = var.github_owner
    prod_web_host          = var.prod_web_host
    prod_api_host          = var.prod_api_host
    dev_web_host           = var.dev_web_host
    dev_api_host           = var.dev_api_host
    ghcr_auth              = local.ghcr_auth
  })

  cloudinit_dev = templatefile("${path.module}/cloudinit.yaml.tftpl", {
    deploy_public_key      = trimspace(tls_private_key.dev_deploy.public_key_openssh)
    tailscale_authkey      = var.tailscale_authkey_dev
    hostname               = "dev-1"
    acme_email             = var.acme_email
    traefik_dashboard_host = var.traefik_dashboard_host_dev
    github_owner           = var.github_owner
    prod_web_host          = var.prod_web_host
    prod_api_host          = var.prod_api_host
    dev_web_host           = var.dev_web_host
    dev_api_host           = var.dev_api_host
    ghcr_auth              = local.ghcr_auth
  })
}
resource "hcloud_server" "prod" {
  name        = "prod-1"
  image       = var.image
  server_type = var.server_type_prod
  location    = var.location

  ssh_keys     = [hcloud_ssh_key.mac.id]
  user_data    = local.cloudinit_prod
  firewall_ids = [hcloud_firewall.prod_web.id]

}

resource "hcloud_server" "dev" {
  name        = "dev-1"
  image       = var.image
  server_type = var.server_type_dev
  location    = var.location

  ssh_keys     = [hcloud_ssh_key.mac.id]
  user_data    = local.cloudinit_dev
  firewall_ids = [hcloud_firewall.dev_web.id]
}

output "dev_server_ip" {
  value = hcloud_server.dev.ipv4_address
}

output "prod_server_ip" {
  value = hcloud_server.prod.ipv4_address
}

output "dev_deploy_private_key" {
  value     = tls_private_key.dev_deploy.private_key_openssh
  sensitive = true
}

output "prod_deploy_private_key" {
  value     = tls_private_key.prod_deploy.private_key_openssh
  sensitive = true
}
