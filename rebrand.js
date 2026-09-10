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
      if (['node_modules', '.next', '.git', 'package-lock.json', '.vs'].includes(file)) {
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
      { regex: /shakti-prana/g, replace: 'sakhi' },
      { regex: /Shakti-Prana/g, replace: 'SAKHI' },
      { regex: /SHAKTI-PRANA/g, replace: 'SAKHI' },
      { regex: /Shakti Prana/g, replace: 'SAKHI' },
      { regex: /SHAKTI PRANA/g, replace: 'SAKHI' }
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
    // skip script itself
    if (filePath.endsWith('rebrand.js') || filePath.endsWith('replace_script.js')) return;
    replaceInFile(filePath);
  });
  console.log('Done replacing!');
});
