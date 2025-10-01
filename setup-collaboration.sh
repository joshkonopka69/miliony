#!/bin/bash

# SportMap Collaboration Setup Script
echo "🤝 Setting up collaboration workflow for SportMap..."
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create feature branches
echo "🌿 Creating feature branches..."

# Create authentication branch
git checkout -b feature/authentication-setup 2>/dev/null || echo "Branch feature/authentication-setup already exists"
git checkout -b feature/ui-improvements 2>/dev/null || echo "Branch feature/ui-improvements already exists"

# Go back to main
git checkout main

echo ""
echo "📋 Setting up file ownership strategy..."

# Create .gitattributes for better merge handling
cat > .gitattributes << 'EOF'
# Auto detect text files and perform LF normalization
* text=auto

# React Native specific
*.js text eol=lf
*.jsx text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.json text eol=lf

# Images
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary

# Documentation
*.md text eol=lf
*.txt text eol=lf
EOF

echo "✅ Created .gitattributes for better merge handling"

# Create collaboration checklist
cat > COLLABORATION_CHECKLIST.md << 'EOF'
# 🤝 Daily Collaboration Checklist

## Before Starting Work:
- [ ] `git checkout main && git pull origin main`
- [ ] `git checkout feature/your-branch`
- [ ] `git rebase main` (if needed)
- [ ] Check what files you're modifying
- [ ] Communicate with your partner

## During Work:
- [ ] Make small, focused commits
- [ ] Push changes regularly
- [ ] Test your changes
- [ ] Document any breaking changes

## Before Merging:
- [ ] Test thoroughly
- [ ] Rebase on latest main
- [ ] Communicate with partner
- [ ] Resolve any conflicts

## After Merging:
- [ ] Clean up feature branch
- [ ] Update documentation
- [ ] Test the merged code
EOF

echo "✅ Created collaboration checklist"

# Create conflict resolution script
cat > resolve-conflicts.sh << 'EOF'
#!/bin/bash

echo "🔧 Conflict Resolution Helper"
echo ""

# Check for conflicts
if [ -z "$(git status --porcelain | grep '^UU')" ]; then
    echo "✅ No merge conflicts found"
    exit 0
fi

echo "⚠️  Merge conflicts detected in:"
git status --porcelain | grep '^UU' | cut -c4-

echo ""
echo "📋 Conflict resolution steps:"
echo "1. Open each conflicted file"
echo "2. Look for conflict markers: <<<<<<< HEAD"
echo "3. Choose which changes to keep"
echo "4. Remove conflict markers"
echo "5. Test the resolution"
echo "6. Run: git add . && git commit"

echo ""
echo "🛠️  Tools to help:"
echo "- VS Code: code . (opens merge tool)"
echo "- Command line: git mergetool"
echo "- Manual: Edit files and remove markers"
EOF

chmod +x resolve-conflicts.sh

echo "✅ Created conflict resolution helper"

# Create daily sync script
cat > daily-sync.sh << 'EOF'
#!/bin/bash

echo "🔄 Daily Sync Routine"
echo ""

# Get latest changes
echo "📥 Pulling latest changes..."
git checkout main
git pull origin main

# Update current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Updating $CURRENT_BRANCH with latest main..."
    git checkout $CURRENT_BRANCH
    git rebase main
    echo "✅ Branch updated"
else
    echo "📍 Already on main branch"
fi

echo ""
echo "📊 Current status:"
git status --short

echo ""
echo "🌿 Available branches:"
git branch -a
EOF

chmod +x daily-sync.sh

echo "✅ Created daily sync script"

# Create merge script
cat > merge-feature.sh << 'EOF'
#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: ./merge-feature.sh <branch-name>"
    echo "Example: ./merge-feature.sh feature/authentication-setup"
    exit 1
fi

BRANCH_NAME=$1

echo "🔄 Merging $BRANCH_NAME into main..."

# Switch to main
git checkout main
git pull origin main

# Merge the feature branch
git merge $BRANCH_NAME

if [ $? -eq 0 ]; then
    echo "✅ Merge successful!"
    echo "📤 Pushing to origin..."
    git push origin main
    
    echo "🧹 Cleaning up..."
    git branch -d $BRANCH_NAME
    git push origin --delete $BRANCH_NAME
    
    echo "✅ Feature branch cleaned up"
else
    echo "❌ Merge failed. Please resolve conflicts manually."
    echo "Run ./resolve-conflicts.sh for help"
fi
EOF

chmod +x merge-feature.sh

echo "✅ Created merge script"

echo ""
echo "🎉 Collaboration setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review COLLABORATION_GUIDE.md"
echo "2. Check COLLABORATION_CHECKLIST.md"
echo "3. Start working on your feature branch:"
echo "   git checkout feature/authentication-setup"
echo "4. Use daily-sync.sh every morning"
echo "5. Use merge-feature.sh when ready to merge"
echo ""
echo "🤝 Happy collaborating!"

