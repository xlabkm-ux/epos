const fs = require('fs');
const path = require('path');

// Load GITHUB_TOKEN from .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const tokenMatch = envContent.match(/GITHUB_TOKEN=(ghp_[a-zA-Z0-9]+)/);

if (!tokenMatch) {
  console.error('GITHUB_TOKEN not found in .env');
  process.exit(1);
}

const GITHUB_TOKEN = tokenMatch[1];
const REPO = "xlabkm-ux/epios";
const API_BASE = "https://api.github.com";

async function request(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'EPIOS-Automation-Agent'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
}

async function run() {
  console.log(`--- Starting GitHub Automation for ${REPO} ---`);

  // 1. Create Issues
  const issues = [
    {
      title: "Delivery Governance: Enable Branch Protection",
      body: "Protect main branch, require PRs, CI pass, no direct push. Required for ADR-0099 compliance.",
      labels: ["governance", "p0"]
    },
    {
      title: "Release: Publish v0.1.0-rc.1",
      body: "Tag the current main branch and publish the release candidate. Refer to CHANGELOG.md for notes.",
      labels: ["delivery", "p0"]
    },
    {
      title: "Phase 4: Mission & Evidence Domain Implementation",
      body: "Implement full EPIOS-02/EPIOS-05 entities and persistence adapters.",
      labels: ["domain", "p0"]
    },
    {
      title: "Security: Implement MCP_SECURITY_TEST_PLAN.md",
      body: "Automated verification of the MCP bridge and data redaction policies.",
      labels: ["security", "p0"]
    }
  ];

  for (const issue of issues) {
    try {
      const created = await request(`/repos/${REPO}/issues`, 'POST', issue);
      console.log(`Created Issue #${created.number}: ${issue.title}`);
    } catch (e) {
      console.error(`Failed to create issue "${issue.title}": ${e.message}`);
    }
  }

  // 2. Create Release Candidate
  try {
    const release = await request(`/repos/${REPO}/releases`, 'POST', {
      tag_name: 'v0.1.0-rc.1',
      name: 'v0.1.0-rc.1: Epistemic OS Foundation',
      body: 'Initial Release Candidate with CI/CD, Documentation Governance, and Core Domain Foundations.',
      draft: false,
      prerelease: true
    });
    console.log(`Published Release: ${release.html_url}`);
  } catch (e) {
    console.error(`Failed to create release: ${e.message}`);
  }

  // 3. Set Branch Protection for 'main'
  try {
    await request(`/repos/${REPO}/branches/main/protection`, 'PUT', {
      required_status_checks: {
        strict: true,
        contexts: ["CI"]
      },
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true
      },
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false
    });
    console.log("Enabled Branch Protection for 'main'");
  } catch (e) {
    console.warn(`Failed to set branch protection: ${e.message}. (Note: This requires repository admin rights or Pro/Team plan)`);
  }

  console.log("--- Automation Complete ---");
}

run();
