#!/usr/bin/bash

mv $(find ./_posts -type d | shuf -n 1) posts/
