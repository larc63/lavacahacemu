#!/usr/bin/env node
import sharp from 'sharp';
import {
    argv
} from 'node:process';
import {
    parse as parsePath
} from "node:path";

const dest = 'templates';
const sizes = [1200, 800, 600, 400];
const size_names = ['large', 'original', 'small', 'mini'];
const webPSettings = {
    quality: 63,
    alphaQuality: 63,
    effort: 6,
    force: true
};

const name = parsePath(argv[2]).name;
const p = [];
const logs = [];
sizes.forEach((s, i) => {
    p.push(new Promise((resolve) => {
        sharp(argv[2], {
            failOnError: false
        })
            .resize(s)
            .webp(webPSettings)
            .toFile(`${dest}/${name}-${size_names[i]}.webp`)
            .then(() => {
                logs.push(`${dest}/${name}-${size_names[i]}px.webp written`);
                resolve();
            });
    }));
});
await Promise.all(p);
console.log(logs.join('\n'));