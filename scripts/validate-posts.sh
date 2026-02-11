#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if command -v rg >/dev/null 2>&1; then
  finder_cmd="rg"
else
  finder_cmd="grep"
fi

matches_pattern() {
  local pattern="$1"
  if [[ "$finder_cmd" == "rg" ]]; then
    printf '%s\n' "$frontmatter" | rg -qi "$pattern"
  else
    printf '%s\n' "$frontmatter" | grep -Eqi "$pattern"
  fi
}

required_fields=(
  title
  date
  lastmod
  description
  slug
  tags
  image
  layout
  toc
  draft
)

errors=0
require_published=false
published_dirs=(
  content/blog
)

if [[ "${1:-}" == "--require-published" ]]; then
  require_published=true
fi

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

  has_draft_false=false
  if matches_pattern '^[[:space:]]*draft[[:space:]]*[:=][[:space:]]*false([[:space:]]|$)'; then
    has_draft_false=true
  fi

  if [[ "$require_published" == "true" && "$has_draft_false" == "false" ]]; then
    echo "ERROR ${file}: draft must be false in --require-published mode."
    errors=$((errors + 1))
    continue
  fi

  if [[ "$require_published" == "false" && "$has_draft_false" == "false" ]]; then
    echo "ERROR ${file}: draft=true content is in a published section; move it to content/drafts."
    errors=$((errors + 1))
    continue
  fi

  kind_value="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*kind[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"
  publish_section_value="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*publish_section[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"
  if [[ "$file" == content/blog/stories/* ]]; then
    if [[ "$kind_value" != "story" ]]; then
      echo "ERROR ${file}: kind must be 'story' for content/blog/stories."
      errors=$((errors + 1))
    fi
    if [[ -n "$publish_section_value" && "$publish_section_value" != "stories" ]]; then
      echo "ERROR ${file}: publish_section must be 'stories' for content/blog/stories."
      errors=$((errors + 1))
    fi
  elif [[ "$file" == content/blog/artifacts/* ]]; then
    if [[ "$kind_value" != "artifact" ]]; then
      echo "ERROR ${file}: kind must be 'artifact' for content/blog/artifacts."
      errors=$((errors + 1))
    fi
    if [[ -n "$publish_section_value" && "$publish_section_value" != "artifacts" ]]; then
      echo "ERROR ${file}: publish_section must be 'artifacts' for content/blog/artifacts."
      errors=$((errors + 1))
    fi
  else
    if [[ -n "$publish_section_value" && "$publish_section_value" != "blog" ]]; then
      echo "ERROR ${file}: publish_section must be 'blog' for legacy content/blog paths."
      errors=$((errors + 1))
    fi
  fi

  missing=()
  for field in "${required_fields[@]}"; do
    if ! matches_pattern "^[[:space:]]*${field}[[:space:]]*[:=]"; then
      missing+=("$field")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "ERROR ${file}: missing fields -> ${missing[*]}"
    errors=$((errors + 1))
  fi

  if [[ "$finder_cmd" == "rg" ]]; then
    image_line="$(printf '%s\n' "$frontmatter" | rg -m1 '^[[:space:]]*image[[:space:]]*[:=]')"
  else
    image_line="$(printf '%s\n' "$frontmatter" | grep -Em1 '^[[:space:]]*image[[:space:]]*[:=]')"
  fi
  if [[ -n "$image_line" ]]; then
    image_file="$(printf '%s\n' "$image_line" | sed -E 's/^[[:space:]]*image[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/' | tr -d "'" | xargs)"
    if [[ -n "$image_file" ]]; then
      if [[ ! -f "assets/banners/${image_file}" ]]; then
        echo "ERROR ${file}: banner not found -> assets/banners/${image_file}"
        errors=$((errors + 1))
      fi
    fi
  fi
done < <(
  for dir in "${published_dirs[@]}"; do
    [[ -d "$dir" ]] || continue
    find "$dir" -type f -name "index.md" ! -name "_index.md"
  done | sort
)

if [[ $errors -gt 0 ]]; then
  echo
  echo "Validation failed with ${errors} issue(s)."
  exit 1
fi

echo "All published posts passed front matter and banner checks."
