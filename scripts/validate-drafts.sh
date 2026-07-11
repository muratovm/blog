#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

errors=0

get_frontmatter() {
  local file="$1"
  awk '
    NR==1 {
      delim=$0
      if ($0 != "---" && $0 != "+++") exit 0
      next
    }
    $0 == delim {exit}
    {print}
  ' "$file"
}

has_draft_true() {
  grep -Eqi '^[[:space:]]*draft[[:space:]]*[:=][[:space:]]*"?true"?([[:space:]#].*)?$'
}

has_draft_false() {
  grep -Eqi '^[[:space:]]*draft[[:space:]]*[:=][[:space:]]*"?false"?([[:space:]#].*)?$'
}

# Guard: content/drafts can hold draft-only bundles, but never publishable posts.
drafts_dir_count=0
while IFS= read -r file; do
  frontmatter="$(get_frontmatter "$file")"
  if printf '%s\n' "$frontmatter" | has_draft_true; then
    echo "DRAFT ${file} (content/drafts; ignored by publish/status until moved under content/blog)"
    drafts_dir_count=$((drafts_dir_count + 1))
    continue
  fi

  if printf '%s\n' "$frontmatter" | has_draft_false; then
    echo "ERROR ${file}: draft is false in content/drafts. Move published posts under content/blog/ or set draft: true."
  else
    echo "ERROR ${file}: index.md in content/drafts must explicitly set draft: true."
  fi
  errors=$((errors + 1))
done < <(find content/drafts -type f -name "index.md" ! -name "_index.md" | sort)

# Report draft posts currently in content/blog
draft_count=0
while IFS= read -r file; do
  frontmatter="$(get_frontmatter "$file")"
  if printf '%s\n' "$frontmatter" | has_draft_true; then
    echo "DRAFT ${file}"
    draft_count=$((draft_count + 1))
  fi
done < <(find content/blog -type f -name "index.md" ! -name "_index.md" | sort)

echo
echo "${draft_count} draft(s) in content/blog."
echo "${drafts_dir_count} draft bundle(s) in content/drafts."

if [[ $errors -gt 0 ]]; then
  echo "Draft validation failed with ${errors} issue(s)."
  exit 1
fi

echo "Draft validation passed."
