#!/usr/bin/bash
f=$(find ./_posts -type d | shuf -n 1)
echo "${f}"
mv ${f} posts/
