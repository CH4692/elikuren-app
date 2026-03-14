output "repository_name" {
  value = github_repository.this.name
}

output "repository_html_url" {
  value = github_repository.this.html_url
}

output "default_branch" {
  value = github_branch_default.default.branch
}