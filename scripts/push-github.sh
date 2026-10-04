#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${AMBLER_REPO_URL:-https://github.com/russellstokes-ai/Ambler.git}"
BRANCH="main"

if [ ! -d .git ]; then
  git init -b "$BRANCH"
fi

git config user.name "${GIT_AUTHOR_NAME:-Ambler Build}"
git config user.email "${GIT_AUTHOR_EMAIL:-build@ambler.local}"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "feat: import Ambler release candidate"
fi

git fetch origin "$BRANCH" || true
# The GitHub repo was created as an empty/initializer target for Ambler. Replace
# that bootstrap state with this verified release-candidate source.
git push --force-with-lease origin HEAD:"$BRANCH"

echo "Ambler source pushed to $REPO_URL ($BRANCH)."
