#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
cache_dir="${repo_root}/.hugo_cache"

./scripts/validate-posts.sh
./scripts/validate-drafts.sh
./scripts/validate-assets.sh
hugo --cacheDir "$cache_dir" --cleanDestinationDir --gc --minify

echo
echo "Checks passed. Starting preview server at http://localhost:1313/"
exec hugo server --cacheDir "$cache_dir" --bind 127.0.0.1 --port 1313 --baseURL "http://127.0.0.1:1313/" --disableFastRender
