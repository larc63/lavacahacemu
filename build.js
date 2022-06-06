// const fs = require('fs');
import {
  readdirSync,
  readFileSync
} from 'node:fs';

import { getHTML } from "md2html";

const DEST = 'dist;'
console.log('Starting conversion');

const dirs = readdirSync('posts');

dirs.forEach(d => {
  const files = readdirSync(`posts/${d}`).filter(f => f.endsWith('md'));
  files.forEach(f => {
    console.log(`Converting ${f}`);
    const mdContent = readFileSync(`posts/${d}/${f}`, 'utf-8');
    getHTML(mdContent);
  });
});
