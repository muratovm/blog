#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

errors=0

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

  if [[ -z "$frontmatter" ]]; then
    echo "ERROR ${file}: missing front matter block."
    errors=$((errors + 1))
    continue
  fi

  if ! printf '%s\n' "$frontmatter" | grep -Eqi '^[[:space:]]*draft[[:space:]]*:[[:space:]]*true([[:space:]]|$)'; then
    echo "ERROR ${file}: drafts in content/drafts must set draft: true."
    errors=$((errors + 1))
  fi
done < <(find content/drafts -type f -name "index.md" ! -name "_index.md" | sort)

if [[ $errors -gt 0 ]]; then
  echo
  echo "Draft validation failed with ${errors} issue(s)."
  exit 1
fi

echo "All drafts under content/drafts correctly use draft: true."
