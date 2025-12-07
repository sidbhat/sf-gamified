#!/bin/bash
# Package Joule Quest for Chrome Web Store submission

echo "📦 Packaging Joule Quest for Chrome Web Store..."

# Define package name
PACKAGE_NAME="joule-quest-v1.0.0"
ZIP_FILE="${PACKAGE_NAME}.zip"

# Remove old package if exists
if [ -f "$ZIP_FILE" ]; then
    echo "🗑️  Removing old package..."
    rm "$ZIP_FILE"
fi

echo "📁 Creating ZIP package..."

# Create ZIP with only necessary files
zip -r "$ZIP_FILE" \
    manifest.json \
    src/ \
    assets/ \
    -x "*.DS_Store" \
    -x "*/.DS_Store" \
    -x "*.git*" \
    -x "node_modules/*" \
    -x "*.md" \
    -x "CHROME-STORE-*" \
    -x "package-for-chrome-store.sh"

echo ""
echo "✅ Package created: $ZIP_FILE"
echo ""
echo "📋 Pre-Submission Checklist:"
echo "   [ ] Icons created (icon-16.png, icon-48.png, icon-128.png)"
echo "   [ ] Screenshots captured (5 required)"
echo "   [ ] Privacy policy hosted and URL added to manifest"
echo "   [ ] Support email configured"
echo "   [ ] Tested extension thoroughly"
echo ""
echo "📤 Next Steps:"
echo "   1. Review checklist above"
echo "   2. Go to https://chrome.google.com/webstore/devconsole"
echo "   3. Click 'New Item' and upload $ZIP_FILE"
echo "   4. Fill in store listing (see CHROME-STORE-LISTING.md)"
echo "   5. Submit for review"
echo ""
echo "📖 Full guide: See CHROME-STORE-SUBMISSION.md"
