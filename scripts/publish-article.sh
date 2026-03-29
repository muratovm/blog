#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

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

target="${1:-}"
if [[ -z "$target" ]]; then
  echo "Usage: npm run publish:article -- <draft-slug-or-path>"
  echo "Example: npm run publish:article -- my-story-slug"
  echo "Example: npm run publish:article -- stories/my-story-slug"
  exit 1
fi

# Find the draft under content/blog/ (drafts now live at their final destination)
src=""
if [[ -f "content/blog/${target}/index.md" ]]; then
  src="content/blog/${target}/index.md"
else
  mapfile -t matches < <(find content/blog -type f -path "*/${target}/index.md" | sort)
  if [[ ${#matches[@]} -eq 1 ]]; then
    src="${matches[0]}"
  elif [[ ${#matches[@]} -gt 1 ]]; then
    echo "Error: multiple matches found for '${target}':"
    printf '  - %s\n' "${matches[@]}"
    echo "Use a more specific path under content/blog."
    exit 1
  fi
fi

if [[ -z "$src" ]]; then
  echo "Error: post not found under content/blog for '${target}'."
  exit 1
fi

frontmatter="$(get_frontmatter "$src")"
if [[ -z "$frontmatter" ]]; then
  echo "Error: ${src} is missing a valid front matter block."
  exit 1
fi

# Must currently be a draft
if ! printf '%s\n' "$frontmatter" | grep -Eqi '^[[:space:]]*draft[[:space:]]*[:=][[:space:]]*true([[:space:]]|$)'; then
  echo "Error: ${src} must have draft: true before publishing."
  exit 1
fi

missing=()
for field in "${required_fields[@]}"; do
  if ! printf '%s\n' "$frontmatter" | grep -Eqi "^[[:space:]]*${field}[[:space:]]*[:=]"; then
    missing+=("$field")
  fi
done
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Error: ${src} is missing required fields -> ${missing[*]}"
  exit 1
fi

image_ref="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*image[[:space:]]*[:=][[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"
if [[ -n "$image_ref" ]]; then
  if [[ "$image_ref" == /* ]]; then
    if [[ ! -f "static${image_ref}" ]]; then
      echo "Error: front matter image not found -> static${image_ref}"
      exit 1
    fi
  else
    if [[ ! -f "assets/banners/${image_ref}" ]]; then
      echo "Error: front matter banner not found -> assets/banners/${image_ref}"
      exit 1
    fi
  fi
fi

# Validate all markdown image references before publishing.
while IFS= read -r ref; do
  rel="$(printf '%s' "$ref" | sed -E 's/^!\[[^]]*\]\(([^)]+)\)$/\1/' | tr -d '"' | tr -d "'")"
  if [[ "$rel" =~ ^https?:// ]] || [[ "$rel" =~ ^mailto: ]] || [[ "$rel" =~ ^data: ]] || [[ "$rel" =~ ^# ]]; then
    continue
  fi
  if [[ "$rel" == /* ]]; then
    if [[ ! -f "static${rel}" ]]; then
      echo "Error: markdown image not found -> static${rel}"
      exit 1
    fi
  else
    if [[ ! -f "$(dirname "$src")/${rel}" ]]; then
      echo "Error: markdown image not found -> $(dirname "$src")/${rel}"
      exit 1
    fi
  fi
done < <(grep -Eo '!\[[^]]*\]\([^)]+\)' "$src" || true)

while IFS= read -r line; do
  rel="$(printf '%s' "$line" | sed -En 's/.*src="([^"]+)".*/\1/p')"
  [[ -z "$rel" ]] && continue
  if [[ "$rel" =~ ^https?:// ]] || [[ "$rel" =~ ^data: ]] || [[ "$rel" =~ ^# ]]; then
    continue
  fi
  if [[ "$rel" == /* ]]; then
    if [[ ! -f "static${rel}" ]]; then
      echo "Error: shortcode image not found -> static${rel}"
      exit 1
    fi
  else
    if [[ ! -f "$(dirname "$src")/${rel}" ]]; then
      echo "Error: shortcode image not found -> $(dirname "$src")/${rel}"
      exit 1
    fi
  fi
done < <(grep -E '\{\{< *img ' "$src" || true)

# Set draft: false and status: published in-place (no file move needed).
tmp_file="$(mktemp)"
fm_delim="$(head -n 1 "$src")"
awk -v fm_delim="$fm_delim" '
  BEGIN {
    is_toml = (fm_delim == "+++")
    draft_replaced = 0
    status_replaced = 0
  }
  /^[[:space:]]*draft[[:space:]]*[:=][[:space:]]*/ {
    if ($0 ~ /=/) print "draft = false"
    else print "draft: false"
    draft_replaced = 1
    next
  }
  /^[[:space:]]*status[[:space:]]*[:=][[:space:]]*/ {
    if ($0 ~ /=/) print "status = \"published\""
    else print "status: published"
    status_replaced = 1
    next
  }
  { print }
  END {
    if (draft_replaced != 1) {
      if (is_toml) print "draft = false"
      else print "draft: false"
    }
    if (status_replaced != 1) {
      if (is_toml) print "status = \"published\""
      else print "status: published"
    }
  }
' "$src" > "$tmp_file"
mv "$tmp_file" "$src"

echo "Published ${src}"
