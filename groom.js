const fs = require("fs");
const path = require("path");

(function() {
    let files = fs.readdirSync("_drafts");
    files = files.filter(e => !e.startsWith("."))
                .filter(e => e.endsWith(".md"))
                .map(function (file) {
        return "_drafts" + path.sep + file;
    });
    // console.log(files);
    files.forEach(fileName => {
        let dataIn = fs.readFileSync(fileName, 'utf8');
        let dataOut = [];
        let lines = dataIn.split("\n");
        lines.forEach(line => {
            if (line.startsWith("title")) {
                let title = line.substring("title: ".length);
                title = title.split("-").join(" ");
                line = "title: \"" + title + "\"";
            }
            if (line.startsWith("cover_image")) {
                let sm = line.replace("cover_image", "cover_image_small");
                sm = sm.replace("-original", "-500px");
                line = line + "\n" + sm;
            }
            dataOut.push(line);
        });
        // console.log(dataOut.join("\n"));
        fs.writeFileSync(fileName, dataOut.join("\n"), 'utf8');
        console.log("wrote" + fileName);
    });
})();


