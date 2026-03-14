terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}


provider "github" {
  token = var.github_token
  owner = var.github_owner
}

#########################################################
# ELIKUREN MONOREPO
#########################################################

module "app_elikuren" {
  source = "./modules/github_repo"

  name        = "elikuren-app"
  description = "Monorepo for Next.js frontend, FastAPI backend, deploy and infra"
  visibility  = var.repo_visibility

  default_branch      = "dev"
  create_environments = true

  protect_main = true
  protect_dev  = true
  protect_prod = true

  main_approvals_required = 1
  dev_approvals_required  = 0
  prod_approvals_required = 1

  # GHCR Secrets für CI/CD
  set_ghcr_secrets = true

  enable_clerk               = true
  enable_image_tag_variables = true

  ghcr_username = var.ghcr_username
  ghcr_token    = var.ghcr_token

  dev_image_tag  = "dev-latest"
  prod_image_tag = "prod-latest"

  clerk_publishable_key_dev  = var.clerk_publishable_key_dev
  clerk_publishable_key_prod = var.clerk_publishable_key_prod

  clerk_sign_in_url                   = var.clerk_sign_in_url
  clerk_sign_in_fallback_redirect_url = var.clerk_sign_in_fallback_redirect_url
  clerk_sign_up_fallback_redirect_url = var.clerk_sign_up_fallback_redirect_url

  clerk_proxy_url_dev  = var.clerk_proxy_url_dev
  clerk_proxy_url_prod = var.clerk_proxy_url_prod

  dev_host    = var.dev_host
  dev_user    = var.dev_user
  dev_ssh_key = var.dev_ssh_key

  prod_host    = var.prod_host
  prod_user    = var.prod_user
  prod_ssh_key = var.prod_ssh_key
}
