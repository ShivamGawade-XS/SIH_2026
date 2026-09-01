const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:/Users/ASHWITH/.gemini/antigravity-ide/scratch/SIH_2026/frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace text-[9px] with text-[10px] md:text-[9px]
    content = content.replace(/(?<!md:)text-\[9px\]/g, 'text-[10px] md:text-[9px]');
    
    // Replace text-[10px] with text-xs md:text-[10px]
    content = content.replace(/(?<!md:)text-\[10px\]/g, 'text-xs md:text-[10px]');
    
    // Replace text-xs with text-sm md:text-xs
    content = content.replace(/(?<!md:)(?<!sm:)(?<!lg:)(?<!xl:)(?<!2xl:)\btext-xs\b/g, 'text-sm md:text-xs');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
