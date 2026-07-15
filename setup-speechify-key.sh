#!/bin/bash
# setup-speechify-key.sh — one-time setup: saves your Speechify API key to a
# local file (.speechify.env). Never leaves your computer, excluded from git.

set -e
cd "$(dirname "$0")"

echo ""
echo "The Daily Reset — Speechify API key setup"
echo "------------------------------------------"
echo "Paste your Speechify API key below, then press Enter."
echo "(It's safe to paste here — this only writes to a file on your Mac.)"
echo ""
read -r -p "Paste key here: " SPEECHIFY_KEY

if [ -z "$SPEECHIFY_KEY" ]; then
  echo ""
  echo "No key entered — nothing was saved. Run this script again when you're ready."
  exit 1
fi

echo "SPEECHIFY_API_KEY=$SPEECHIFY_KEY" > .speechify.env

MASKED="${SPEECHIFY_KEY:0:6}...${SPEECHIFY_KEY: -4}"
echo ""
echo "✅ Saved. Key on file: $MASKED"
echo "Stored in: $(pwd)/.speechify.env (excluded from git — will never be pushed to GitHub)"
echo ""
