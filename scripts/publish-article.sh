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
  echo "Example: npm run publish:article -- secure-api-logging"
  echo "Example: npm run publish:article -- [guides]/[security]/thm_ftp_room"
  exit 1
fi

src=""
if [[ -f "content/drafts/${target}/index.md" ]]; then
  src="content/drafts/${target}/index.md"
else
  mapfile -t matches < <(find content/drafts -type f -path "*/${target}/index.md" | sort)
  if [[ ${#matches[@]} -eq 1 ]]; then
    src="${matches[0]}"
  elif [[ ${#matches[@]} -gt 1 ]]; then
    echo "Error: multiple draft matches found for '${target}':"
    printf '  - %s\n' "${matches[@]}"
    echo "Use a more specific path under content/drafts."
    exit 1
  fi
fi

if [[ -z "$src" ]]; then
  echo "Error: draft not found under content/drafts for '${target}'."
  exit 1
fi

frontmatter="$(get_frontmatter "$src")"
if [[ -z "$frontmatter" ]]; then
  echo "Error: ${src} is missing a valid front matter block."
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

if ! printf '%s\n' "$frontmatter" | grep -Eqi '^[[:space:]]*draft[[:space:]]*:[[:space:]]*true([[:space:]]|$)'; then
  echo "Error: ${src} must have draft: true before publishing."
  exit 1
fi

image_ref="$(printf '%s\n' "$frontmatter" | sed -En 's/^[[:space:]]*image[[:space:]]*:[[:space:]]*"?([^"#]+)"?.*$/\1/p' | head -n 1 | tr -d "'" | xargs)"
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

# Validate all image references in this draft file before publishing.
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

src_dir="$(dirname "$src")"
dst_dir="${src_dir/content\/drafts/content\/blog}"
dst_index="${dst_dir}/index.md"

if [[ -e "$dst_dir" ]]; then
  echo "Error: destination already exists -> ${dst_dir}"
  exit 1
fi

mkdir -p "$(dirname "$dst_dir")"
mv "$src_dir" "$dst_dir"

tmp_file="$(mktemp)"
awk '
  /^draft:[[:space:]]*/ {
    print "draft: false"
    replaced = 1
    next
  }
  { print }
  END {
    if (replaced != 1) {
      print "draft: false"
    }
  }
' "$dst_index" > "$tmp_file"
mv "$tmp_file" "$dst_index"

echo "Published ${dst_index}"
