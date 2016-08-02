#!/usr/bin/env bash
cd "$1"
git config user.name $2
git config user.email $3
git add .
git commit -m "$4"
git pull
git push