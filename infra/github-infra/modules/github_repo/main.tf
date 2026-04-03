terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

resource "github_repository" "this" {
  name        = var.name
  description = var.description
  visibility  = var.visibility
  auto_init   = var.auto_init

  has_issues   = true
  has_projects = false
  has_wiki     = false

  allow_merge_commit     = false
  allow_rebase_merge     = false
  allow_squash_merge     = true
  delete_branch_on_merge = true
}

# --- Branches ---
# GitHub erstellt bei auto_init=true i.d.R. main als initial branch.
# Wir erstellen dev/prod als Branches von main.
resource "github_branch" "dev" {
  repository    = github_repository.this.name
  branch        = "dev"
  source_branch = "main"
  depends_on    = [github_repository.this]
}

resource "github_branch" "prod" {
  repository    = github_repository.this.name
  branch        = "prod"
  source_branch = "main"
  depends_on    = [github_repository.this]
}

# Default branch setzen (du willst "dev")
resource "github_branch_default" "default" {
  repository = github_repository.this.name
  branch     = var.default_branch
  depends_on = [github_branch.dev]
}

# --- Environments (dev/prod) ---
resource "github_repository_environment" "dev" {
  count       = var.create_environments ? 1 : 0
  repository  = github_repository.this.name
  environment = "dev"
}

resource "github_repository_environment" "prod" {
  count       = var.create_environments ? 1 : 0
  repository  = github_repository.this.name
  environment = "prod"
}

# --- Environment Variables (nicht geheim) ---
resource "github_actions_environment_variable" "dev_image_tag" {
  count         = local.image_tag_variables_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.dev[0].environment
  variable_name = "IMAGE_TAG"
  value         = var.dev_image_tag
}

resource "github_actions_environment_variable" "prod_image_tag" {
  count         = local.image_tag_variables_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.prod[0].environment
  variable_name = "IMAGE_TAG"
  value         = var.prod_image_tag
}

resource "github_actions_environment_variable" "dev_clerk_sign_in_url" {
  count         = local.clerk_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.dev[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_SIGN_IN_URL"
  value         = var.clerk_sign_in_url
}

resource "github_actions_environment_variable" "prod_clerk_sign_in_url" {
  count         = local.clerk_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.prod[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_SIGN_IN_URL"
  value         = var.clerk_sign_in_url
}

resource "github_actions_environment_variable" "dev_clerk_sign_in_fallback_redirect_url" {
  count         = local.clerk_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.dev[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL"
  value         = var.clerk_sign_in_fallback_redirect_url
}

resource "github_actions_environment_variable" "prod_clerk_sign_in_fallback_redirect_url" {
  count         = local.clerk_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.prod[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL"
  value         = var.clerk_sign_in_fallback_redirect_url
}

resource "github_actions_environment_variable" "dev_clerk_sign_up_fallback_redirect_url" {
  count         = local.clerk_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.dev[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL"
  value         = var.clerk_sign_up_fallback_redirect_url
}

resource "github_actions_environment_variable" "prod_clerk_sign_up_fallback_redirect_url" {
  count         = local.clerk_enabled ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.prod[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL"
  value         = var.clerk_sign_up_fallback_redirect_url
}

resource "github_actions_environment_variable" "dev_clerk_proxy_url" {
  count         = local.clerk_enabled && var.clerk_proxy_url_dev != "" ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.dev[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_PROXY_URL"
  value         = var.clerk_proxy_url_dev
}

resource "github_actions_environment_variable" "prod_clerk_proxy_url" {
  count         = local.clerk_enabled && var.clerk_proxy_url_prod != "" ? 1 : 0
  repository    = github_repository.this.name
  environment   = github_repository_environment.prod[0].environment
  variable_name = "NEXT_PUBLIC_CLERK_PROXY_URL"
  value         = var.clerk_proxy_url_prod
}

# --- Environment Secrets (geheim) ---
locals {
  ghcr_enabled                = var.create_environments && var.set_ghcr_secrets && var.ghcr_username != "" && var.ghcr_token != ""
  clerk_enabled               = var.create_environments && var.enable_clerk
  image_tag_variables_enabled = var.create_environments && var.enable_image_tag_variables
  dev_deploy_enabled          = var.create_environments && var.dev_host != "" && var.dev_user != "" && var.dev_ssh_key != ""
  prod_deploy_enabled         = var.create_environments && var.prod_host != "" && var.prod_user != "" && var.prod_ssh_key != ""
}

resource "github_actions_environment_secret" "dev_ghcr_username" {
  count           = local.ghcr_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "GHCR_USERNAME"
  plaintext_value = var.ghcr_username
}

resource "github_actions_environment_secret" "dev_ghcr_token" {
  count           = local.ghcr_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "GHCR_TOKEN"
  plaintext_value = var.ghcr_token
}

resource "github_actions_environment_secret" "prod_ghcr_username" {
  count           = local.ghcr_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "GHCR_USERNAME"
  plaintext_value = var.ghcr_username
}

resource "github_actions_environment_secret" "prod_ghcr_token" {
  count           = local.ghcr_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "GHCR_TOKEN"
  plaintext_value = var.ghcr_token
}

resource "github_actions_environment_secret" "dev_clerk_publishable_key" {
  count           = local.clerk_enabled && var.clerk_publishable_key_dev != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  plaintext_value = var.clerk_publishable_key_dev
}

resource "github_actions_environment_secret" "prod_clerk_publishable_key" {
  count           = local.clerk_enabled && var.clerk_publishable_key_prod != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  plaintext_value = var.clerk_publishable_key_prod
}

resource "github_actions_environment_secret" "clerk_issuer_dev" {
  count           = local.clerk_enabled != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "CLERK_ISSUER"
  plaintext_value = var.clerk_issuer_dev
}

resource "github_actions_environment_secret" "clerk_issuer_prod" {
  count           = local.clerk_enabled != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "CLERK_ISSUER"
  plaintext_value = var.clerk_issuer_prod
}

resource "github_actions_environment_secret" "clerk_webhook_secret_dev" {
  count           = local.clerk_enabled != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "CLERK_WEBHOOK_SECRET"
  plaintext_value = var.clerk_webhook_secret_dev
}

resource "github_actions_environment_secret" "clerk_webhook_secret_prod" {
  count           = local.clerk_enabled != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "CLERK_WEBHOOK_SECRET"
  plaintext_value = var.clerk_webhook_secret_prod
}

resource "github_actions_environment_secret" "dev_host" {
  count           = local.dev_deploy_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "DEV_HOST"
  plaintext_value = var.dev_host
}

resource "github_actions_environment_secret" "dev_user" {
  count           = local.dev_deploy_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "DEV_USER"
  plaintext_value = var.dev_user
}

resource "github_actions_environment_secret" "dev_ssh_key" {
  count           = local.dev_deploy_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.dev[0].environment
  secret_name     = "DEV_SSH_KEY"
  plaintext_value = var.dev_ssh_key
}

resource "github_actions_environment_secret" "prod_host" {
  count           = local.dev_deploy_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "PROD_HOST"
  plaintext_value = var.prod_host
}

resource "github_actions_environment_secret" "prod_user" {
  count           = local.dev_deploy_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "PROD_USER"
  plaintext_value = var.prod_user
}

resource "github_actions_environment_secret" "prod_ssh_key" {
  count           = local.dev_deploy_enabled ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod[0].environment
  secret_name     = "PROD_SSH_KEY"
  plaintext_value = var.prod_ssh_key
}

# --- Branch Protection ---
# main
resource "github_branch_protection" "main" {
  count         = var.protect_main ? 1 : 0
  repository_id = github_repository.this.node_id
  pattern       = "main"

  required_linear_history = true
  enforce_admins          = false

  required_pull_request_reviews {
    required_approving_review_count = var.main_approvals_required
  }
}

# dev
resource "github_branch_protection" "dev" {
  count         = var.protect_dev ? 1 : 0
  repository_id = github_repository.this.node_id
  pattern       = "dev"

  required_linear_history = true
  enforce_admins          = false

  required_pull_request_reviews {
    required_approving_review_count = var.dev_approvals_required
  }

  depends_on = [github_branch.dev]
}

# prod
resource "github_branch_protection" "prod" {
  count         = var.protect_prod ? 1 : 0
  repository_id = github_repository.this.node_id
  pattern       = "prod"

  required_linear_history = true
  enforce_admins          = true

  required_pull_request_reviews {
    required_approving_review_count = var.prod_approvals_required
  }

  depends_on = [github_branch.prod]
}
