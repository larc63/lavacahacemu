#!/usr/bin/node
 // const fs = require('fs');
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';

import {
  parse as parsePath
} from "node:path";

import {
  getHTML
} from "md2html";

import sharp from 'sharp';

const DEST = 'dist'

const postData = [];

// HELPERS -

const sanitizeURL = u => {
  u = u.replaceAll(' ', '-');
  u = u.replaceAll('\'', '');
  return encodeURI(u);
}

const getPathFromDate = p => {
  const d = new Date(p.getDate());
  const retVal = `${d.getUTCFullYear()}/${d.getUTCMonth()+1}/${d.getUTCDate()}`;
  p.getDatePath = () => retVal;
}

const sizes = [500, 800];
const generateResponsiveImages = async (name, src, dest) => {
  name = parsePath(name).name;
  const webPSettings = {
    quality: 63,
    alphaQuality: 63,
    effort: 6,
    force: true
  };
  const p = [];
  const logs = [];

  sizes.forEach(s => {
    p.push(new Promise((resolve) => {
      sharp(src)
        .resize(s)
        .webp(webPSettings)
        .toFile(`${dest}/${name}-${s}px.webp`)
        .then(() => {
          logs.push(`${dest}/${name}-${s}px.webp written`);
          resolve();
        });
    }));
  });
  p.push(new Promise((resolve) => {
    sharp(src)
      .webp(webPSettings)
      .toFile(`${dest}/${name}-original.webp`)
      .then(() => {
        logs.push(`${dest}/${name}-original.webp written`);
        resolve();
      });
  }));
  await Promise.all(p);
  // console.log(logs.join('\n'));
}

// CLEAN - CLEAN - CLEAN - CLEAN - CLEAN - CLEAN - CLEAN - CLEAN - CLEAN - CLEAN

rmSync(DEST, {
  recursive: true,
  force: true
});

// RESOURCES - RESOURCES - RESOURCES - RESOURCES - RESOURCES - RESOURCES - RESOURCES

if (!existsSync(`${DEST}/images`)) {
  mkdirSync(`${DEST}/images`, {
    recursive: true
  });
}

if (!existsSync(`${DEST}/styles`)) {
  mkdirSync(`${DEST}/styles`, {
    recursive: true
  });
}

copyFileSync('templates/fonts/Lato-Regular.ttf', `${DEST}/Lato-Regular.ttf`);

let resources = readdirSync('templates').filter(f => f.endsWith('webp'));
resources.forEach(r => {
  copyFileSync(`templates/${r}`, `${DEST}/images/${r}`);
})

copyFileSync('templates/main.css', `${DEST}/styles/main.css`);

// POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS

console.log('Starting post conversion');

const postTemplate = readFileSync('templates/post.html', 'utf-8');

const dirs = readdirSync('posts');

for (const d of dirs) {
  const files = readdirSync(`posts/${d}`).filter(f => f.endsWith('md'));
  for (const f of files) {
    console.log(`Converting ${f}`);
    const mdContent = readFileSync(`posts/${d}/${f}`, 'utf-8');
    const [p, html] = getHTML(mdContent, postTemplate);
    // console.log(`postData = ${JSON.stringify(p)}`);
    postData.push(p);
    // console.log(html);
    getPathFromDate(p);
    const dir = `${DEST}/${p.getDatePath()}/${parsePath(f).name}`;
    if (!existsSync(dir)) {
      mkdirSync(dir, {
        recursive: true
      });
    }
    writeFileSync(`${dir}/index.html`, html, 'utf-8');

    resources = readdirSync(`posts/${parsePath(f).name}`).filter(f => !f.endsWith('md'));
    // console.log(`resources = ${resources}`);
    for (const r of resources) {
      // generate responsive images in webp
      await generateResponsiveImages(r, `posts/${parsePath(f).name}/${r}`, dir);
    };

    console.log(`Finished ${f}`);
  };
}

// INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX

console.log('Creating index');

const indexTemplate = readFileSync('templates/index.html', 'utf-8');
const html = [];
const sorted = postData.sort((a, b) => {
  const da = new Date(a.getDate());
  const db = new Date(b.getDate());
  return db - da;
})
sorted.forEach(p => {
  const title = p.getTitle();
  console.log(`Title: ${title}`);

  const dp = p.getDatePath();
  const href = sanitizeURL(`${dp}/${title}`);

  console.log(`href: ${href}`);

  const src = `${href}/${sanitizeURL(p.getThumb())}`;
  console.log(`src: ${src}`);

  html.push(`<div class="post">
              <a href="${href}">
                <img src="${src}" class="post-img" alt="${title}" loading="lazy">
                <div class="overlay">
                  <span class="overlay-text">${title}</span>
                </div>
              </a>
            </div>`);
});

const s = indexTemplate.replace('%%POSTDATA%%', html.join('\n'));

writeFileSync(`${DEST}/index.html`, s, 'utf-8');
