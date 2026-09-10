const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'package-lock.json') {
        if (!--pending) done(null, results);
        return;
      }
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function replaceInFile(filePath) {
  try {
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.json', '.md', '.css', '.html'].includes(ext) && ext !== '') return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    // For UTF-16LE files like maybe README.md, Node handles it via buffer if we detect it, but let's just do utf8 for now, 
    // actually standard fs.readFileSync(filePath, 'utf16le') might be needed if it fails.
    // Let's read as buffer to check for BOM
    const buffer = fs.readFileSync(filePath);
    let encoding = 'utf8';
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        encoding = 'utf16le';
        content = fs.readFileSync(filePath, encoding);
    } else {
        content = buffer.toString('utf8');
    }

    let modified = false;
    
    // Case sensitive replacements
    const replacements = [
      { regex: /sakhi/g, replace: 'shakti-prana' },
      { regex: /Sakhi/g, replace: 'Shakti-Prana' },
      { regex: /SAKHI/g, replace: 'SHAKTI-PRANA' }
    ];

    let newContent = content;
    for (const { regex, replace } of replacements) {
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, replace);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, newContent, encoding);
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

walk(directoryPath, function(err, results) {
  if (err) throw err;
  results.forEach(filePath => {
    // skip this script
    if (filePath.endsWith('replace_script.js')) return;
    replaceInFile(filePath);
  });
  console.log('Done replacing!');
});
