#!/bin/sh

git branch -D gh-pages
git checkout -b gh-pages
rm -rf www/dist/
wasm-pack build
(cd www && npm run build)
cp -R www/dist/* .
