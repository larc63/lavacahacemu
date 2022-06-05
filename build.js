const fs = require('fs');

const DEST = 'dist;'
console.log('Starting conversion');

const dirs = fs.readdirSync('posts');

dirs.forEach(d => {
  const files = fs.readdirSync(`posts/${d}`).filter(f => f.endsWith('md'));
  files.forEach(f => {
    console.log(`Converting ${f}`);
  });
});
