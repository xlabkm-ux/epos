# GitHub Recovery Script for Epistemic OS
# This script creates the missing P0 issues and prepares the release.
# Requires 'gh' CLI to be installed and authenticated.

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed. Please install it: winget install GitHub.cli"
    exit 1
}

$repo = "xlabkm-ux/epios"

Write-Host "--- Creating P0 GitHub Issues ---"

# 1. Branch Protection
gh issue create --repo $repo --title "Delivery Governance: Enable Branch Protection" --body "Protect main branch, require PRs, CI pass, no direct push. This is a P0 requirement for architectural integrity." --label "governance,p0"

# 2. Release Publication
gh issue create --repo $repo --title "Release: Publish v0.1.0-rc.1" --body "The Release Candidate is declared in docs but missing in GitHub Releases. Need to tag the current main and publish the release notes from CHANGELOG.md." --label "delivery,p0"

# 3. Phase 4 Domain
gh issue create --repo $repo --title "Phase 4: Mission & Evidence Domain Implementation" --body "Implement full EPIOS-02/EPIOS-05 entities: Mission, MissionRun, EvidenceSet, Source. Transition from simplified models to the complete epistemic graph." --label "domain,p0"

# 4. Security Implementation
gh issue create --repo $repo --title "Security: Implement MCP_SECURITY_TEST_PLAN.md" --body "Implement automated tests for the MCP bridge as defined in docs/03_specs/MCP_SECURITY_TEST_PLAN.md." --label "security,p0"

Write-Host "--- Creating GitHub Release Candidate ---"
gh release create v0.1.0-rc.1 --repo $repo --title "v0.1.0-rc.1: Epistemic OS Foundation" --notes "Initial Release Candidate including CI/CD, Documentation Governance, and Core Domain Foundations. Refer to CHANGELOG.md for details."

Write-Host "GitHub Recovery complete! Please check Issues and Releases on GitHub."
