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

# Published posts: full checklist before going live
required_fields_published=(
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

# Draft posts: minimal — just enough to be organised
required_fields_draft=(
  title
  date
  type
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

  is_draft=true
  if matches_pattern '^[[:space:]]*draft[[:space:]]*[:=][[:space:]]*false([[:space:]]|$)'; then
    is_draft=false
  fi

  # In --require-published mode every post in content/blog must be published
  if [[ "$require_published" == "true" && "$is_draft" == "true" ]]; then
    echo "ERROR ${file}: draft must be false in --require-published mode."
    errors=$((errors + 1))
    continue
  fi

  # type check — must match path for both draft and published posts
  type_value="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*type[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"
  publish_section_value="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*publish_section[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"

  if [[ "$file" == content/blog/stories/* ]]; then
    if [[ "$type_value" != "story" ]]; then
      echo "ERROR ${file}: type must be 'story' for content/blog/stories."
      errors=$((errors + 1))
    fi
    if [[ -n "$publish_section_value" && "$publish_section_value" != "stories" ]]; then
      echo "ERROR ${file}: publish_section must be 'stories' for content/blog/stories."
      errors=$((errors + 1))
    fi
  elif [[ "$file" == content/blog/artifacts/* ]]; then
    if [[ "$type_value" != "artifact" ]]; then
      echo "ERROR ${file}: type must be 'artifact' for content/blog/artifacts."
      errors=$((errors + 1))
    fi
    if [[ -n "$publish_section_value" && "$publish_section_value" != "artifacts" ]]; then
      echo "ERROR ${file}: publish_section must be 'artifacts' for content/blog/artifacts."
      errors=$((errors + 1))
    fi
    # artifact_type must be set
    artifact_type_value="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*artifact_type[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"
    if [[ -z "$artifact_type_value" ]]; then
      echo "ERROR ${file}: artifact_type is required for content/blog/artifacts (build, guide, or note)."
      errors=$((errors + 1))
    elif [[ "$artifact_type_value" != "build" && "$artifact_type_value" != "guide" && "$artifact_type_value" != "note" ]]; then
      echo "ERROR ${file}: artifact_type must be 'build', 'guide', or 'note' (got '${artifact_type_value}')."
      errors=$((errors + 1))
    fi
  else
    if [[ -n "$publish_section_value" && "$publish_section_value" != "blog" ]]; then
      echo "ERROR ${file}: publish_section must be 'blog' for legacy content/blog paths."
      errors=$((errors + 1))
    fi
  fi

  # Required fields — strict for published, lenient for drafts
  if [[ "$is_draft" == "false" ]]; then
    required_fields=("${required_fields_published[@]}")
  else
    required_fields=("${required_fields_draft[@]}")
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

  # Banner check — required for published posts; warn only for drafts using default.png
  if [[ "$finder_cmd" == "rg" ]]; then
    image_line="$(printf '%s\n' "$frontmatter" | rg -m1 '^[[:space:]]*image[[:space:]]*[:=]' || true)"
  else
    image_line="$(printf '%s\n' "$frontmatter" | grep -Em1 '^[[:space:]]*image[[:space:]]*[:=]' || true)"
  fi
  if [[ -n "$image_line" ]]; then
    image_file="$(printf '%s\n' "$image_line" | sed -E 's/^[[:space:]]*image[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/' | tr -d "'" | xargs)"
    if [[ -n "$image_file" && "$image_file" != "default.png" ]]; then
      if [[ ! -f "assets/banners/${image_file}" ]]; then
        if [[ "$is_draft" == "false" ]]; then
          echo "ERROR ${file}: banner not found -> assets/banners/${image_file}"
          errors=$((errors + 1))
        else
          echo "WARN  ${file}: banner not found -> assets/banners/${image_file}"
        fi
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

echo "All posts passed validation."
