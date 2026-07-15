#!/bin/bash
# setup-telnyx-key.sh — one-time setup: saves your Telnyx API key to a local
# file (.telnyx.env) that tts-generate.js reads automatically. This file
# never leaves your computer and is excluded from git (see .gitignore).

set -e
cd "$(dirname "$0")"

echo ""
echo "The Daily Reset — Telnyx API key setup"
echo "---------------------------------------"
echo "Paste your Telnyx API key below, then press Enter."
echo "(It's safe to paste here — this only writes to a file on your Mac.)"
echo ""
read -r -p "Paste key here: " TELNYX_KEY

if [ -z "$TELNYX_KEY" ]; then
  echo ""
  echo "No key entered — nothing was saved. Run this script again when you're ready."
  exit 1
fi

echo "TELNYX_API_KEY=$TELNYX_KEY" > .telnyx.env

MASKED="${TELNYX_KEY:0:6}...${TELNYX_KEY: -4}"
echo ""
echo "✅ Saved. Key on file: $MASKED"
echo "Stored in: $(pwd)/.telnyx.env (excluded from git — will never be pushed to GitHub)"
echo ""
echo "You're ready to generate audio. Example:"
echo '  node tts-generate.js --voice="Telnyx.NaturalHD.astra" --gender=female --breaks=eyes-step-0 --dry-run'
echo ""
