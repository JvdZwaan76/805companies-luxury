# Staging Workflow

This document describes how to make changes to 805lifeguard.com safely using the staging environment.

**TL;DR:** Edit on `staging` branch, verify at `https://staging.805companies-luxury.pages.dev`, then merge to `main` to deploy to production.

---

## Environments

| Environment | URL | Branch | Purpose |
|---|---|---|---|
| Production | `https://805lifeguard.com` | `main` | Live customer-facing site |
| Staging | `https://staging.805companies-luxury.pages.dev` | `staging` | Pre-production validation |

Staging is protected by Cloudflare Access (email-based one-time PIN). Only authorized emails on the Access policy can view it. Search engines cannot index staging because Access blocks them AND the response includes `X-Robots-Tag: noindex, nofollow, noarchive`.

The staging URL uses Cloudflare Pages' branch alias rather than a custom subdomain on `805lifeguard.com`. This was an intentional architectural decision - Cloudflare Pages binds custom domains to projects, not branches, so a `staging` subdomain on the production domain would have served production content. The `*.pages.dev` URL is uglier but functionally correct, and avoids needing a Worker proxy or a second Pages project.

---

## Branch flow

```
feature/* (optional)  ->  staging  ->  main
                          |             |
                          v             v
                   preview deploy   prod deploy
                   (805companies-luxury.pages.dev)        (805lifeguard.com)
```

Direct pushes to `main` are blocked by GitHub branch protection. All changes to production must go through a pull request from `staging`.

---

## How to make a change

### 1. Make sure your local clone is current

```bash
cd ~/Documents/805companies-luxury
git checkout staging
git pull origin staging
git pull origin main
```

If `git pull origin main` brings in commits that aren't yet on staging, do `git merge main` to bring staging up to date with production before adding your changes.

### 2. Edit files

Edit anything you need to change. For most edits this is HTML, CSS, JS, images, or content files in the repo root.

### 3. Commit

```bash
git add <files-you-changed>
git status
git commit -m "<conventional-commit-message>"
```

Use conventional commit prefixes:

- `feat:` new feature
- `fix:` bug fix
- `chore:` housekeeping (dependencies, formatting)
- `docs:` documentation only
- `ci:` CI/CD config changes
- `style:` formatting/CSS only, no logic
- `refactor:` code restructure, no behavior change

Optionally add a scope: `feat(staging): add new banner`.

### 4. Push to staging

```bash
git push origin staging
```

This triggers the GitHub Actions workflow `Deploy to Cloudflare Pages`. The workflow runs on every push to `main` or `staging`. For the `staging` branch, the `cloudflare/pages-action@v1` action automatically routes the deploy to a Preview environment (since the branch is not the configured `productionBranch: main`).

Build time is typically 60-90 seconds. Watch progress at:

- GitHub Actions: `https://github.com/JvdZwaan76/805companies-luxury/actions`
- Cloudflare Pages: dashboard, Workers & Pages, `805companies-luxury`, Deployments

### 5. Verify on staging

Once the build finishes, visit `https://staging.805companies-luxury.pages.dev`. You'll be prompted to authenticate via Cloudflare Access (one-time email PIN if you don't have an active session).

Test:

- Page loads correctly
- Visual changes look right on desktop AND mobile (resize the window or use DevTools device emulation)
- Console shows no new errors (DevTools, Console)
- Network tab confirms `X-Robots-Tag: noindex, nofollow, noarchive` is present (Response Headers on the document request)

If anything is wrong, fix it on staging and push again. Iterate until staging is green.

### 6. Promote to production

When staging is verified, open a pull request:

```
https://github.com/JvdZwaan76/805companies-luxury/compare/main...staging
```

Or via the GitHub CLI:

```bash
gh pr create --base main --head staging --title "Promote staging to production" --body "..."
```

Branch protection on `main` requires:

- A pull request (no direct push to main)
- The `Cloudflare Pages` status check to pass on the staging deploy

Once the PR's status checks are green, click **Merge pull request** on GitHub. The merge to `main` triggers a new GitHub Actions workflow run, which deploys to production.

After merge:

- Wait 60-90 seconds
- Visit `https://805lifeguard.com` and verify the change is live
- Check `https://805lifeguard.com` headers do NOT contain `X-Robots-Tag` (production must remain indexable)

---

## Rolling back

If a production deploy breaks something, you have two options:

### Option 1 - Rollback via Cloudflare dashboard (fastest, ~30 seconds)

1. Cloudflare, Workers & Pages, `805companies-luxury`, Deployments
2. Find the previous known-good production deployment
3. Click the `...` menu on that row, then **Rollback to this deployment**
4. Confirm

This instantly switches `805lifeguard.com` back to the previous deployment without any git operations. Use this when production is broken and you need to fix it RIGHT NOW.

### Option 2 - Revert via git (slower, ~5 minutes, cleaner history)

```bash
git checkout main
git pull origin main
git revert <bad-commit-sha>
git push origin main
```

This creates a new commit that undoes the bad commit. GitHub Actions then deploys this revert commit to production.

**When to use which:** Option 1 for emergencies. Option 2 for non-critical issues where you want a clean git history. You can also combine: Option 1 immediately to stop the bleeding, then Option 2 later to ensure the next production deploy doesn't re-introduce the bad code.

---

## Common scenarios

### "I accidentally committed to main locally"

If you committed to local `main` but haven't pushed:

```bash
git checkout main
git reset --hard origin/main
```

This wipes your local main back to whatever's on the remote. The commits you made are gone (unless you also have them on another branch).

If you've already pushed to `main`... you can't, because branch protection blocks direct pushes. The push will have failed.

### "Staging looks broken but I'm not sure if it's my change"

```bash
git log --oneline origin/main..origin/staging
```

This lists commits on `staging` that aren't yet on `main`. If your suspect commit is in that list, your change is the cause. If it's not, the issue is something already in production (or shared infrastructure).

### "I need to test something risky"

Make a feature branch off `staging`:

```bash
git checkout staging
git checkout -b feature/<short-description>
git push origin feature/<short-description>
```

Cloudflare Pages will create a per-branch preview at a unique `*.pages.dev` URL (visible in the GitHub Actions workflow output and the Cloudflare Deployments tab). Once you're satisfied, merge into `staging` via PR.

### "I want to compare staging and production side-by-side"

Open `https://805lifeguard.com` in one tab and `https://staging.805companies-luxury.pages.dev` in another. The latter requires Access auth. Use Chrome DevTools' "Toggle Device Toolbar" to test mobile views in both.

For diff inspection of HTML output, in DevTools, Sources, save the rendered HTML of each, then `diff` them locally.

---

## What lives where

- **GitHub repo:** `https://github.com/JvdZwaan76/805companies-luxury`
- **Cloudflare Pages project:** `805companies-luxury` (account: Jaspervdz at me.com)
- **Production custom domains:** `805lifeguard.com`, `www.805lifeguard.com`, plus admin/client/staff subdomains on `805companies.com`
- **Staging URL:** `https://staging.805companies-luxury.pages.dev` (Cloudflare Access protected)
- **GitHub Actions workflow:** `.github/workflows/deploy.yml`
- **Cloudflare headers config:** `_headers` in repo root
- **Cloudflare redirects config:** `_redirects` in repo root
- **GitHub Actions secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

---

## Things NOT to do

- **Never push directly to `main`.** Branch protection should block this, but don't try to bypass it.
- **Never edit `_headers` to apply rules to `/*` if those rules are staging-specific.** The staging noindex rule uses an absolute URL pattern (`https://staging.805companies-luxury.pages.dev/*`) on purpose. Changing it to `/*` would apply noindex to production and de-list `805lifeguard.com` from Google search results.
- **Never commit secrets or credentials.** API tokens, passwords, private keys etc. belong in GitHub Actions secrets or environment variables, not in the repo.
- **Never force-push to `staging` or `main`.** Use `git revert` to undo, not `git push --force`.
- **Never merge to `main` without verifying on staging first.** That's the whole point of having staging.

---

## Troubleshooting

### "GitHub Actions workflow didn't run after my push"

Check `.github/workflows/deploy.yml` - the `branches:` list must include the branch you pushed to. As of writing, both `main` and `staging` are listed. Other branches (`feature/*`, etc.) won't trigger the workflow unless added.

### "Cloudflare Access keeps prompting me to log in"

Access sessions last several hours but expire eventually. Re-authenticate when prompted. If your email isn't recognized, check the Access policy in Cloudflare Zero Trust dashboard - your email must be in the allowed list.

### "I see `X-Robots-Tag: noindex` on production"

This is a critical bug. Production must NEVER have this header. Immediate steps:

1. Roll back via Cloudflare dashboard (Option 1 above)
2. Inspect `_headers` to find the rule that's matching production hostnames
3. Fix on `staging` branch, verify, PR back to main

### "The staging URL returns 302 in curl"

That's Cloudflare Access redirecting to its login page. To inspect headers behind Access, use a browser with an active Access session and look at DevTools Network tab.

---

## Contact

Repo owner: Jasper van der Zwaan (805lifeguard.com business contact: jasper at 805lifeguard.com)

Anthropic Claude conversation history contains the original setup discussion if you need deep context on architecture decisions.
