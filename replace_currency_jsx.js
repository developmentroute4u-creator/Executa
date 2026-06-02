const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        results = results.concat(walk(fullPath));
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const dirs = ['./app', './components', './models', './lib'];
let allFiles = [];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(walk(dir));
  }
});

let updatedCount = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace >${ with >₹{ (this catches things like <span>${val}</span>)
  let newContent = content.replace(/>\$\{/g, '>₹{');
  
  // Replace > ${ with > ₹${
  newContent = newContent.replace(/> \$\{/g, '> ₹{');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    updatedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nUpdated ${updatedCount} files.`);
