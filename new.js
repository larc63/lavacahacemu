#!/usr/bin/env node

import {
  mkdirSync,
  readdirSync,
  rename,
  renameSync,
  writeFileSync
} from 'node:fs';
import {
  argv
} from 'node:process';

const getDate = d => {
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
}

const DEST = 'posts'
let title, img, titleEscaped;

if (!argv[2] && !argv[3]) {
  console.log('Usage: ./new.js <post title> <thumbname>');
} else {
  title = argv[2];
  img = argv[3].toLowerCase();
  titleEscaped = title.replaceAll(' ', '-');
}

let images = readdirSync('.',).filter(f => f.endsWith('.jpg') || f.endsWith('.JPG'));
let content = [];
content.push('---');
content.push(`title: "${title}"`);
content.push(`date: ${getDate(new Date)}`);
content.push('tags:');
content.push('');
content.push(`cover_image: ${img}-original.webp`);
content.push(`cover_image_small: ${img}-500px.webp`);
content.push(`Description: ${title}`);
content.push('linkinbio: true');
content.push('---');
content.push('');

images.forEach((imgName, i) => {
  renameSync(imgName, imgName.toLowerCase());
  images[i] = imgName.toLowerCase();
});

images.forEach(i => {
  const imgName = i.substring(0, i.length-4);
  content.push(`[![](${imgName})](${imgName}-original.webp)`);
});

let p = `${DEST}/${titleEscaped}`;
let mdP = `${p}/${titleEscaped}.md`;

console.log(`Creating ${title}`);
console.log(`at ${p}`);
console.log(`and ${mdP}`);
// console.log(`with contents:\n${content.join('\n')}`);
// console.log(`and images ${images.join(' ')}`);

mkdirSync(p, {recursive: true});
writeFileSync(mdP, content.join('\n'));
images.forEach(i => {
  renameSync(`${i}`, `${p}/${i}`);
});

