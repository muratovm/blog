#!/usr/bin/env bash
set -euo pipefail

if ! command -v hugo >/dev/null 2>&1; then
  echo "Error: hugo is not installed or not in PATH."
  exit 1
fi

slug="${1:-}"
if [[ -z "$slug" ]]; then
  echo "Usage: npm run new:article -- <slug>"
  echo "Example: npm run new:article -- secure-api-logging"
  exit 1
fi

if [[ ! "$slug" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Error: slug must use lowercase letters, numbers, and hyphens only."
  exit 1
fi

target="content/drafts/${slug}/index.md"
if [[ -f "$target" ]]; then
  echo "Error: ${target} already exists."
  exit 1
fi

hugo new "$target"
echo "Created ${target}"
echo "Next: fill in description/tags/image."
echo "When ready to publish, run: npm run publish:article -- ${slug}"
