#!/usr/bin/env bash

# Usage: ./createUser USERNAME PASSWORD

if [ -z $1 ] || [ -z $2 ]; then
    echo "Please provide your desired USERNAME and PASSWORD as command line arguments."
else
    curl -X POST localhost:3000/user/signup -F "name=$1" -F "pwd=$2"
fi
