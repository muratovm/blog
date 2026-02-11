#!/usr/bin/env bash
set -euo pipefail

if ! command -v hugo >/dev/null 2>&1; then
  echo "Error: hugo is not installed or not in PATH."
  exit 1
fi

lane="story"
slug=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--type|--lane)
      lane="${2:-}"
      shift 2
      ;;
    *)
      if [[ -z "$slug" ]]; then
        slug="$1"
      else
        echo "Error: unexpected argument '$1'"
        exit 1
      fi
      shift
      ;;
  esac
done

if [[ -z "$slug" ]]; then
  echo "Usage: npm run new:article -- [--type blog|story|artifact] <slug>"
  echo "Example: npm run new:article -- secure-api-logging"
  echo "Example: npm run new:article -- --type story incident-response-lessons"
  exit 1
fi

if [[ ! "$slug" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Error: slug must use lowercase letters, numbers, and hyphens only."
  exit 1
fi

case "$lane" in
  blog)
    publish_section="blog"
    kind="story"
    archetype_kind="default"
    target="content/drafts/blog/${slug}/index.md"
    ;;
  story|stories)
    lane="story"
    publish_section="stories"
    kind="story"
    archetype_kind="story"
    target="content/drafts/blog/stories/${slug}/index.md"
    ;;
  artifact|artifacts)
    lane="artifact"
    publish_section="artifacts"
    kind="artifact"
    archetype_kind="artifact"
    target="content/drafts/blog/artifacts/${slug}/index.md"
    ;;
  *)
    echo "Error: unsupported type '${lane}'. Use blog, story, or artifact."
    exit 1
    ;;
esac

if [[ -f "$target" ]]; then
  echo "Error: ${target} already exists."
  exit 1
fi

hugo new --kind "$archetype_kind" "$target"

# Inject migration-era metadata. Works for YAML and TOML front matter.
tmp_file="$(mktemp)"
awk -v kind="$kind" -v publish_section="$publish_section" '
  BEGIN {
    in_frontmatter = 0
    saw_kind = 0
    saw_status = 0
    saw_publish_section = 0
  }
  NR == 1 {
    delim = $0
    if ($0 == "---" || $0 == "+++") {
      in_frontmatter = 1
    }
    print
    next
  }
  in_frontmatter && $0 == delim {
    if (delim == "---") {
      if (!saw_kind) print "kind: " kind
      if (!saw_status) print "status: draft"
      if (!saw_publish_section) print "publish_section: " publish_section
    } else {
      if (!saw_kind) print "kind = \"" kind "\""
      if (!saw_status) print "status = \"draft\""
      if (!saw_publish_section) print "publish_section = \"" publish_section "\""
    }
    print
    in_frontmatter = 0
    next
  }
  in_frontmatter {
    if ($0 ~ /^[[:space:]]*kind[[:space:]]*[:=]/) {
      if (delim == "---") print "kind: " kind
      else print "kind = \"" kind "\""
      saw_kind = 1
      next
    }
    if ($0 ~ /^[[:space:]]*status[[:space:]]*[:=]/) {
      if (delim == "---") print "status: draft"
      else print "status = \"draft\""
      saw_status = 1
      next
    }
    if ($0 ~ /^[[:space:]]*publish_section[[:space:]]*[:=]/) {
      if (delim == "---") print "publish_section: " publish_section
      else print "publish_section = \"" publish_section "\""
      saw_publish_section = 1
      next
    }
  }
  { print }
' "$target" > "$tmp_file"
mv "$tmp_file" "$target"

echo "Created ${target}"
echo "Type: ${lane}"
echo "Next: fill in description/tags/image and refine thesis/impact if this is a story."
echo "When ready to publish, run: npm run publish:article -- ${slug}"
