#!/usr/bin/env bash
cd "$1"
git remote add $2 "$5"
git config user.name $2
git config user.email $3
git add --all
git commit -m "$4"
git pull origin master
git push origin master