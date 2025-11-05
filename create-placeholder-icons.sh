#!/bin/bash

# Create placeholder PNG files for PWA icons
# These are minimal 1x1 transparent PNGs
# Replace with actual icons for production

cd icons

# Base64 encoded 1x1 transparent PNG
PNG_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

for size in 72 96 128 144 152 192 384 512; do
    echo "$PNG_BASE64" | base64 -d > "icon-${size}.png"
    echo "Created icon-${size}.png"
done

echo ""
echo "✓ Placeholder icons created"
echo "Note: Replace these with actual icons for production"
echo "Use the icon.svg file or online tools like:"
echo "  - https://realfavicongenerator.net/"
echo "  - https://www.pwabuilder.com/imageGenerator"
