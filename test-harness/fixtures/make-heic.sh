#!/bin/sh
# Builds the synthetic HEIC fixtures from the JPEG fixtures. macOS only (sips).
#
# These are CONVERTED files. They exercise the HEIC decode path, but they are
# not camera-original iPhone photos and are not evidence that HEIC to JPG works
# on real iPhone output. See TESTING.md.
set -e
cd "$(dirname "$0")"
sips -s format heic photo-small.jpg  --out synthetic-small.heic     >/dev/null
sips -s format heic photo-medium.jpg --out synthetic-converted.heic >/dev/null
ls -l synthetic-*.heic
