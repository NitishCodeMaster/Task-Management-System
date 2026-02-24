const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const clientSrc = path.join(root, 'client', 'src');
const serverDir = path.join(root, 'server');

const exts = ['.js', '.jsx', '.css', '.html'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fp));
    } else {
      results.push(fp);
    }
  });
  return results;
}

function stripComments(content, ext) {
  if (ext === '.css') {
    // remove /* ... */
    return content.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  if (ext === '.html') {
    // remove <!-- ... -->
    return content.replace(/<!--([\s\S]*?)-->/g, '');
  }
  // JS/JSX: remove /* */ and //...
  let out = content.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/(^|[^:'"`])\/\/.*$/gm, (m, g1) => (g1 ? g1 : '') );
  return out;
}

function processFiles(baseDir) {
  const files = walk(baseDir).filter((f) => exts.includes(path.extname(f)));
  files.forEach((file) => {
    try {
      const ext = path.extname(file);
      const original = fs.readFileSync(file, 'utf8');
      const stripped = stripComments(original, ext);
      if (stripped !== original) {
        fs.writeFileSync(file, stripped, 'utf8');
        console.log('Updated:', path.relative(root, file));
      }
    } catch (err) {
      console.error('Failed', file, err.message);
    }
  });
}

processFiles(clientSrc);
processFiles(serverDir);
console.log('Done');
