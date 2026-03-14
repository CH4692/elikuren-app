variable "github_token" {
  type = string
}

variable "github_owner" {
  type = string
}

variable "repo_visibility" {
  type    = string
  default = "private"
}

# GHCR
variable "ghcr_username" {
  type = string
}

variable "ghcr_token" {
  type      = string
  sensitive = true
}

# --- Clerk ---
variable "clerk_publishable_key_dev" {
  type      = string
  sensitive = true
}

variable "clerk_publishable_key_prod" {
  type      = string
  sensitive = true
}

variable "clerk_sign_in_url" {
  type    = string
  default = "/sign-in"
}

variable "clerk_sign_in_fallback_redirect_url" {
  type    = string
  default = "/profile"
}

variable "clerk_sign_up_fallback_redirect_url" {
  type    = string
  default = "/profile"
}

variable "clerk_proxy_url_dev" {
  type    = string
  default = ""
}

variable "clerk_proxy_url_prod" {
  type    = string
  default = ""
}


# --- Deploy servers for GitHub Actions ---

variable "dev_host" {
  type    = string
  default = ""
}

variable "dev_user" {
  type    = string
  default = "deploy"
}

variable "dev_ssh_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "prod_host" {
  type    = string
  default = ""
}

variable "prod_user" {
  type    = string
  default = "deploy"
}

variable "prod_ssh_key" {
  type      = string
  sensitive = true
  default   = ""
}
