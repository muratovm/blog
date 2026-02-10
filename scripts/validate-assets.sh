#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

errors=0

is_external_ref() {
  local ref="$1"
  [[ "$ref" =~ ^https?:// ]] || [[ "$ref" =~ ^mailto: ]] || [[ "$ref" =~ ^data: ]] || [[ "$ref" =~ ^# ]]
}

check_path_ref() {
  local file="$1"
  local ref="$2"
  local kind="$3"

  if [[ -z "$ref" ]]; then
    return
  fi

  if is_external_ref "$ref"; then
    return
  fi

  if [[ "$ref" == /* ]]; then
    if [[ ! -f "static${ref}" ]]; then
      echo "ERROR ${file}: missing ${kind} -> static${ref}"
      errors=$((errors + 1))
    fi
    return
  fi

  local file_dir
  file_dir="$(dirname "$file")"
  if [[ ! -f "${file_dir}/${ref}" ]]; then
    echo "ERROR ${file}: missing ${kind} -> ${file_dir}/${ref}"
    errors=$((errors + 1))
  fi
}

while IFS= read -r file; do
  # Markdown image references: ![...](...)
  while IFS= read -r match; do
    ref="$(printf '%s' "$match" | sed -E 's/^!\[[^]]*\]\(([^)]+)\)$/\1/' | tr -d '"' | tr -d "'")"
    check_path_ref "$file" "$ref" "markdown image"
  done < <(grep -Eo '!\[[^]]*\]\([^)]+\)' "$file" || true)

  # Shortcode references: {{< img src="..." >}}
  while IFS= read -r line; do
    ref="$(printf '%s' "$line" | sed -En 's/.*src="([^"]+)".*/\1/p')"
    check_path_ref "$file" "$ref" "shortcode image"
  done < <(grep -E '\{\{< *img ' "$file" || true)

  # Front matter image field in first block only
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

  if [[ -n "$frontmatter" ]]; then
    image_ref="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*image[[:space:]]*:[[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"
    if [[ -n "$image_ref" ]]; then
      if [[ "$image_ref" == /* ]]; then
        check_path_ref "$file" "$image_ref" "front matter image"
      else
        # Banner images are expected in the shared library.
        if [[ ! -f "assets/banners/${image_ref}" ]]; then
          echo "ERROR ${file}: missing front matter banner -> assets/banners/${image_ref}"
          errors=$((errors + 1))
        fi
      fi
    fi
  fi
done < <(find content -type f -name "*.md" | sort)

if [[ $errors -gt 0 ]]; then
  echo
  echo "Asset validation failed with ${errors} issue(s)."
  exit 1
fi

echo "All markdown/shortcode/front matter image references are valid."
