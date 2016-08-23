#!/usr/bin/env bash
cd "$1"
git remote add $2 "$3"
git pull $2 master