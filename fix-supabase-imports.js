// Fix all Supabase imports to use centralized config
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixSupabaseImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixSupabaseImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix imports from './supabase' to '../config/supabase'
      if (content.includes("from './supabase'")) {
        content = content.replace(/from '\.\/supabase'/g, "from '../config/supabase'");
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
      }
      
      // Fix imports from '../services/supabase' to '../config/supabase'
      if (content.includes("from '../services/supabase'")) {
        content = content.replace(/from '\.\.\/services\/supabase'/g, "from '../config/supabase'");
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
      }
    }
  });
}

console.log('🔧 Fixing all Supabase imports...');
fixSupabaseImports(srcDir);
console.log('✅ All Supabase imports fixed!');
