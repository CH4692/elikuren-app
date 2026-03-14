variable "name" {
  type = string
}

variable "description" {
  type    = string
  default = ""
}

variable "visibility" {
  type    = string
  default = "private"
}

variable "auto_init" {
  type    = bool
  default = true
}

variable "default_branch" {
  type    = string
  default = "dev"
}

variable "create_environments" {
  type    = bool
  default = true
}

# Branch protection toggles
variable "protect_main" {
  type    = bool
  default = true
}

variable "protect_dev" {
  type    = bool
  default = true
}

variable "protect_prod" {
  type    = bool
  default = true
}

variable "main_approvals_required" {
  type    = number
  default = 1
}

variable "dev_approvals_required" {
  type    = number
  default = 0
}

variable "prod_approvals_required" {
  type    = number
  default = 1
}

# --- CI/CD: GHCR secrets + env vars ---
variable "set_ghcr_secrets" {
  type    = bool
  default = true
}

variable "ghcr_username" {
  type    = string
  default = ""
}

variable "ghcr_token" {
  type      = string
  default   = ""
  sensitive = true
}

# Per-environment image tags (dev/prod getrennt)
variable "dev_image_tag" {
  type    = string
  default = "dev-latest"
}

variable "prod_image_tag" {
  type    = string
  default = "prod-latest"
}

# --- Clerk: environment secrets + variables ---
variable "clerk_publishable_key_dev" {
  type      = string
  default   = ""
  sensitive = true
}

variable "clerk_publishable_key_prod" {
  type      = string
  default   = ""
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

variable "enable_clerk" {
  type    = bool
  default = true
}

variable "enable_image_tag_variables" {
  type    = bool
  default = true
}

# --- Deploy server secrets (used by GitHub Actions deploy workflows) ---

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
  default   = ""
  sensitive = true
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
  default   = ""
  sensitive = true
}
