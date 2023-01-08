#!/usr/bin/env node
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
import {
  argv
} from 'node:process';

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
      sharp(src, {
          failOnError: false
        })
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
    sharp(src, {
        failOnError: false
      })
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

if (!existsSync(`${DEST}/scripts`)) {
  mkdirSync(`${DEST}/scripts`, {
    recursive: true
  });
}

copyFileSync('templates/fonts/Lato-Regular.ttf', `${DEST}/Lato-Regular.ttf`);
copyFileSync('templates/favicon.ico', `${DEST}/favicon.ico`);
copyFileSync('templates/apple-touch-icon.png', `${DEST}/apple-touch-icon.png`);
copyFileSync('templates/robots.txt', `${DEST}/robots.txt`);
copyFileSync('templates/main.js', `${DEST}/scripts/main.js`);

let resources = readdirSync('templates').filter(f => f.endsWith('webp'));
resources.forEach(r => {
  copyFileSync(`templates/${r}`, `${DEST}/images/${r}`);
})

copyFileSync('templates/main.css', `${DEST}/styles/main.css`);

// POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS

console.log('Starting post conversion');

const postTemplate = readFileSync('templates/post.html', 'utf-8');

const inputDir = 'posts';

const dirs = readdirSync(inputDir);

if (argv[2]) {
  console.log(`filtering for directory ${argv[2]}`);
}

for (const d of dirs) {
  if (argv[2] && argv[2] !== `posts/${d}`) {
    continue;
  }
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

    resources = readdirSync(`posts/${parsePath(f).name}`).filter(f => !f.endsWith('md') && !f.endsWith('gif'));
    // console.log(`resources = ${resources}`);
    for (const r of resources) {
      // generate responsive images in webp
      await generateResponsiveImages(r, `posts/${parsePath(f).name}/${r}`, dir);
    };

    const gifs = readdirSync(`posts/${parsePath(f).name}`).filter(f => f.endsWith('gif'));
    gifs.forEach(g => {
      copyFileSync(`posts/${parsePath(f).name}/${g}`, `${dir}/${g}`);
    });

    console.log(`Finished ${f}`);
  };
}

// SORTING - SORTING - SORTING - SORTING - SORTING - SORTING - SORTING - SORTING

const sorted = postData.sort((a, b) => {
  const da = new Date(a.getDate());
  const db = new Date(b.getDate());
  return db - da;
})

// INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX

console.log('Creating index and linkinbio');

const indexTemplate = readFileSync('templates/index.html', 'utf-8');
const dataForIndex = [];
const dataForLinkInBio = [];

sorted.forEach(p => {
  const title = p.getTitle();
  console.log(`Title: ${title}`);

  const dp = p.getDatePath();
  const href = sanitizeURL(`${dp}/${title}`);

  console.log(`href: ${href}`);

  let t = p.getThumb(),
    src;
  if (typeof t === 'undefined') {
    t = '/images/brand-original.webp';
    // t = '/images/banner_nye_original.webp';
    src = `${sanitizeURL(t)}`;
  } else {
    src = `${href}/${sanitizeURL(t)}`;
  }
  console.log(`src: ${src}`);

  dataForIndex.push(`<div class="post">
              <a href="${href}">
                <img src="${src}" class="post-img" alt="${title}" loading="lazy">
                <div class="overlay">
                  <span class="overlay-text">${title}</span>
                </div>
              </a>
            </div>`);
  if (p.getLinkInBio() == true) {

    dataForLinkInBio.push(`<div class="post">
                <a href="${href}">
                  <img src="${src}" class="post-img" alt="${title}" loading="lazy">
                  <div class="overlay">
                    <span class="overlay-text">${title}</span>
                  </div>
                </a>
              </div>`);

  }
});

const s = indexTemplate.replace('%%POSTDATA%%', dataForIndex.join('\n'));

writeFileSync(`${DEST}/index.html`, s, 'utf-8');

const l = indexTemplate.replace('%%POSTDATA%%', dataForLinkInBio.join('\n'));

writeFileSync(`${DEST}/linkinbio.html`, l, 'utf-8');
