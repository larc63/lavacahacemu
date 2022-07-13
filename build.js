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

const DEST = 'dist'

const postData = [];

const sanitizeURL = u => {
  u = u.replaceAll(' ', '-');
  u = u.replaceAll('\'', '');
  return encodeURI(u);
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

let resources = readdirSync('templates').filter(f => f.endsWith('webp'));
resources.forEach(r => {
  copyFileSync(`templates/${r}`, `${DEST}/images/${r}`);
})

copyFileSync('templates/main.css', `${DEST}/styles/main.css`);

// POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS - POSTS

console.log('Starting post conversion');

const postTemplate = readFileSync('templates/post.html', 'utf-8');

const dirs = readdirSync('posts');

dirs.forEach(d => {
  const files = readdirSync(`posts/${d}`).filter(f => f.endsWith('md'));
  files.forEach(f => {
    console.log(`Converting ${f}`);
    const mdContent = readFileSync(`posts/${d}/${f}`, 'utf-8');
    const [p, html] = getHTML(mdContent, postTemplate);
    console.log(`postData = ${JSON.stringify(p)}`);
    postData.push(p);
    // console.log(html);
    const dir = `${DEST}/${parsePath(f).name}`;
    if (!existsSync(dir)) {
      mkdirSync(dir, {
        recursive: true
      });
    }
    writeFileSync(`${dir}/index.html`, html, 'utf-8');

    resources = readdirSync(`posts/${parsePath(f).name}`).filter(f => !f.endsWith('md'));
    // console.log(`resources = ${resources}`);
    resources.forEach(r => {
      copyFileSync(`posts/${parsePath(f).name}/${r}`, `${dir}/${r}`);
    });
  });
});


// INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX - INDEX

const indexTemplate = readFileSync('templates/index.html', 'utf-8');
const html = [];
postData.forEach(p => {
  const src = sanitizeURL(`${p.getTitle()}/${p.getThumb()}`);
  const href = sanitizeURL(`${p.getTitle()}`);
  console.log(`Title: ${p.getTitle()}`);
  console.log(`src: ${src}`);
  console.log(`href: ${href}`);
  html.push(`<div class="post">
              <a href="${href}">
                <img src="${src}" class="post-img">
                <div class="overlay">
                  <span class="overlay-text">${p.getTitle()}</span>
                </div>
              </a>
            </div>`);
});

const s = indexTemplate.replace('%%POSTDATA%%', html.join('\n'));

writeFileSync(`${DEST}/index.html`, s, 'utf-8');
