#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

errors=0

# Guard: content/drafts should only contain meta files, not publishable posts.
# Real drafts live in content/blog/ with draft: true.
while IFS= read -r file; do
  echo "ERROR ${file}: publishable index.md found in content/drafts. Move it to content/blog/ with draft: true."
  errors=$((errors + 1))
done < <(find content/drafts -type f -name "index.md" ! -name "_index.md" | sort)

if [[ $errors -gt 0 ]]; then
  echo
  echo "Draft validation failed with ${errors} issue(s)."
  exit 1
fi

# Report draft posts currently in content/blog
draft_count=0
while IFS= read -r file; do
  frontmatter="$(
    awk '
      NR==1 {
        delim=$0
        if ($0 != "---" && $0 != "+++") exit 0
        next
      }
      $0 == delim {exit}
      {print}
    ' "$file"
  )"
  if printf '%s\n' "$frontmatter" | grep -Eqi '^[[:space:]]*draft[[:space:]]*[:=][[:space:]]*true([[:space:]]|$)'; then
    echo "DRAFT ${file}"
    draft_count=$((draft_count + 1))
  fi
done < <(find content/blog -type f -name "index.md" ! -name "_index.md" | sort)

echo
echo "${draft_count} draft(s) in content/blog. content/drafts is clean."
