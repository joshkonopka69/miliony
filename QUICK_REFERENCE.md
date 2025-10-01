# 🚀 Quick Reference - Avoiding Merge Conflicts

## 📋 **Daily Commands**

### **Start of Day:**
```bash
./daily-sync.sh
```

### **During Work:**
```bash
# Make changes
git add .
git commit -m "Descriptive message"
git push origin feature/your-branch
```

### **End of Day:**
```bash
git status
git log --oneline -5
```

## 🛡️ **Conflict Prevention**

### **File Ownership:**
- **You:** `src/services/`, `src/contexts/AuthContext.tsx`, auth components
- **Friend:** `src/screens/`, `src/components/`, UI components

### **Communication:**
- Share what files you're modifying
- Coordinate on shared components
- Discuss breaking changes

## 🔧 **When Conflicts Happen**

### **1. Check Status:**
```bash
git status
```

### **2. Resolve Conflicts:**
```bash
./resolve-conflicts.sh
```

### **3. Test Resolution:**
```bash
npx expo start --localhost
```

### **4. Commit Resolution:**
```bash
git add .
git commit -m "Resolve merge conflicts"
```

## 🚀 **Ready to Merge**

### **1. Test Everything:**
```bash
npx expo start --localhost
# Test all functionality
```

### **2. Merge Feature:**
```bash
./merge-feature.sh feature/your-branch-name
```

### **3. Clean Up:**
```bash
git checkout main
git pull origin main
```

## 📞 **Emergency Commands**

### **Backup Current Work:**
```bash
git checkout -b backup/$(date +%Y%m%d-%H%M%S)
git push origin backup/$(date +%Y%m%d-%H%M%S)
```

### **Reset to Last Good State:**
```bash
git checkout main
git reset --hard HEAD~1
```

### **Cherry-pick Specific Commits:**
```bash
git cherry-pick commit-hash
```

## 🎯 **Success Tips**

1. **Commit frequently** (every 1-2 hours)
2. **Push regularly** (every few commits)
3. **Test before merging**
4. **Communicate early**
5. **Keep commits small**
6. **Use descriptive messages**

## 🚨 **Red Flags**

- ❌ Large commits with multiple changes
- ❌ Modifying same files simultaneously
- ❌ Not communicating changes
- ❌ Merging without testing
- ❌ Ignoring conflict warnings

## ✅ **Green Flags**

- ✅ Small, focused commits
- ✅ Clear file ownership
- ✅ Regular communication
- ✅ Testing before merging
- ✅ Clean git history

