const fs = require("fs");
const parser = require('node-html-parser');
const path = require("path");
const http = require('http');
const https = require('https');


var download = function (url, dest) {
    return new Promise((resolve, reject) => {
        var protocol = http;
        if (url.startsWith("https")) {
            protocol = https;
        }
        console.log("downloading from: " + url);
        console.log("saving to: " + dest);
        var arr = dest.split(".");
        var type = arr[arr.length - 1];
        if (type !== "jpg" && type !== "png") {
            console.log("skipping non image");
            resolve();
        // } else if (fs.existsSync(dest)) {
        //     console.log("*** " + dest + " has already been downloaded");
        //     resolve();
        } else {
            var file = fs.createWriteStream(dest);
            protocol.get(url, function (response) {
                console.log("finished downloading");
                response.pipe(file);
                file.on('finish', function () {
                    file.close(function () {
                        console.log("finished saving");
                        resolve();
                    }); // close() is async, call cb after close completes.
                });
            }).on('error', function (err) { // Handle errors
                fs.unlink(dest, function () {}); // Delete the file async. (But we don't check the result)
                reject(err.message);
            });
        }
    });
};

function getURL(file) {
    return new Promise((resolve, reject) => {
        // console.log("reading " + file);
        let data = fs.readFileSync(file, 'utf8');
        // console.log(data);
        const root = parser.parse(data);
        if(root){
            const img = root.querySelector("img");
            if(img){
                const url = img.attributes.src;
                if(url){
                    console.log(url);
                    resolve(url);
                }
                reject("parse failed - no src attributes");
            }
            reject("parse failed on " + file + " - no img");
        }
        reject("parse failed");

    });
}

async function parseAndDownload(source, dest) {
    try {
        let url = await getURL(source);
        await download(url, dest);
    } catch (error) {
        console.log(error);
    }
}

let d = fs.readdirSync("_drafts");
d = d.filter(e => !e.startsWith("."));
d = d.filter(e => !e.endsWith(".md"));
//console.log(d);

for (let i = 0; i < d.length; i++) {
// for (let i = 0; i < 5; i++) {
    const dir = d[i];
    // console.log(dir);
    let files = fs.readdirSync("_drafts" + path.sep + dir);
    // console.log(files);
    files = files.filter(e => e.endsWith(".jpg"));
    files.forEach(f => {
        let g = f.replace(".jpg", ".html");
        f = "_drafts" + path.sep + dir + path.sep + f;
        g = "_drafts" + path.sep + dir + path.sep + g;
        // console.log("replace " + f + " with " + g);
        fs.renameSync(f, g);
        // fs.copyFileSync(f, g);
        // parseAndDownload(g, f);
    });
}