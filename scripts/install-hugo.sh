#!/usr/bin/env bash
set -euo pipefail

HUGO_VERSION="${HUGO_VERSION:-0.155.3}"
HUGO_EDITION="${HUGO_EDITION:-extended}"
HUGO_PLATFORM="${HUGO_PLATFORM:-linux-amd64}"

INSTALL_DIR="${PWD}/.local/bin"
TMP_DIR="${PWD}/.tmp-hugo"

mkdir -p "${INSTALL_DIR}" "${TMP_DIR}"

if command -v hugo >/dev/null 2>&1; then
  CURRENT_VERSION="$(hugo version | sed -n 's/^hugo v\([0-9.]*\).*/\1/p' | head -n 1)"
  if [ "${CURRENT_VERSION}" = "${HUGO_VERSION}" ]; then
    echo "hugo v${HUGO_VERSION} already installed"
    exit 0
  fi
fi

echo "Installing hugo v${HUGO_VERSION} (${HUGO_EDITION}, ${HUGO_PLATFORM})"

CANDIDATE_ARCHIVES=(
  "hugo_${HUGO_EDITION}_${HUGO_VERSION}_${HUGO_PLATFORM}.tar.gz"
  "hugo_${HUGO_VERSION}_${HUGO_EDITION}_${HUGO_PLATFORM}.tar.gz"
)

ARCHIVE=""
for candidate in "${CANDIDATE_ARCHIVES[@]}"; do
  DOWNLOAD_URL="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${candidate}"
  if curl -fsSL -o "${TMP_DIR}/${candidate}" "${DOWNLOAD_URL}"; then
    ARCHIVE="${candidate}"
    break
  fi
done

if [ -z "${ARCHIVE}" ]; then
  echo "Failed to download Hugo archive for v${HUGO_VERSION} (${HUGO_EDITION}, ${HUGO_PLATFORM})" >&2
  exit 1
fi

tar -xzf "${TMP_DIR}/${ARCHIVE}" -C "${TMP_DIR}" hugo
install -m 0755 "${TMP_DIR}/hugo" "${INSTALL_DIR}/hugo"
export PATH="${INSTALL_DIR}:${PATH}"

echo "Installed binary: ${INSTALL_DIR}/hugo"
"${INSTALL_DIR}/hugo" version
