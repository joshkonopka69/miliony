#!/bin/bash

# Backend Adaptation Script - Adapt to Frontend Changes
echo "🔄 Backend Adaptation to Frontend Changes"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

# Get latest changes
echo "📥 Pulling latest frontend changes..."
git checkout main
git pull origin main

# Create adaptation branch
BRANCH_NAME="feature/backend-adaptation-$(date +%Y%m%d-%H%M%S)"
git checkout -b $BRANCH_NAME

echo "✅ Created adaptation branch: $BRANCH_NAME"
echo ""

# Analyze changes
echo "🔍 Analyzing frontend changes..."

# Check what files changed in the last commit
echo "📋 Files changed in last commit:"
git diff --name-only HEAD~1

echo ""
echo "📋 New files added:"
git diff --name-only --diff-filter=A HEAD~1

echo ""
echo "📋 Modified files:"
git diff --name-only --diff-filter=M HEAD~1

echo ""
echo "🔍 Analyzing specific changes..."

# Look for new screens
echo "🖥️  New screens:"
find src/screens -name "*.tsx" -newer .git/refs/heads/main 2>/dev/null || echo "No new screens found"

# Look for new components
echo "🧩 New components:"
find src/components -name "*.tsx" -newer .git/refs/heads/main 2>/dev/null || echo "No new components found"

# Look for new contexts
echo "🌐 New contexts:"
find src/contexts -name "*.tsx" -newer .git/refs/heads/main 2>/dev/null || echo "No new contexts found"

# Look for new hooks
echo "🪝 New hooks:"
find src/hooks -name "*.ts" -newer .git/refs/heads/main 2>/dev/null || echo "No new hooks found"

echo ""
echo "🔍 Looking for API calls and data requirements..."

# Look for new API calls
echo "📡 API calls found:"
grep -r "fetch\|axios\|api" src/screens src/components 2>/dev/null || echo "No API calls found"

# Look for new interfaces
echo "📋 Interfaces found:"
grep -r "interface\|type" src/screens src/components 2>/dev/null || echo "No interfaces found"

# Look for context usage
echo "🌐 Context usage found:"
grep -r "useContext\|useState" src/screens src/components 2>/dev/null || echo "No context usage found"

echo ""
echo "📊 Analysis complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes above"
echo "2. Identify what backend services need to be updated"
echo "3. Check what new API endpoints are needed"
echo "4. Update your backend services accordingly"
echo "5. Test the integration"
echo ""
echo "🛠️  Useful commands:"
echo "- View specific file changes: git show HEAD -- path/to/file"
echo "- See detailed diff: git diff HEAD~1"
echo "- Check what your friend added: git log --oneline -5"
echo ""
echo "💡 Pro tip: Ask your friend about any unclear requirements!"

