#!/bin/bash
# setup-elevenlabs-key.sh — one-time setup: saves your ElevenLabs API key to a
# local file (.elevenlabs.env). Never leaves your computer, excluded from git.

set -e
cd "$(dirname "$0")"

echo ""
echo "The Daily Reset — ElevenLabs API key setup"
echo "-------------------------------------------"
echo "Paste your ElevenLabs API key below, then press Enter."
echo "(It's safe to paste here — this only writes to a file on your Mac.)"
echo ""
read -r -p "Paste key here: " ELEVEN_KEY

if [ -z "$ELEVEN_KEY" ]; then
  echo ""
  echo "No key entered — nothing was saved. Run this script again when you're ready."
  exit 1
fi

echo "ELEVENLABS_API_KEY=$ELEVEN_KEY" > .elevenlabs.env

MASKED="${ELEVEN_KEY:0:6}...${ELEVEN_KEY: -4}"
echo ""
echo "✅ Saved. Key on file: $MASKED"
echo "Stored in: $(pwd)/.elevenlabs.env (excluded from git — will never be pushed to GitHub)"
echo ""
