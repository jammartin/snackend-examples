#!/usr/bin/env bash

# Usage: ./login USERNAME PASSWORD
# If login suceeds, the JWT is stored in 'auth_token'.

source ./base_url # contains BASE_URL

TOKEN_FILE=./auth_token

if [ -z $1 ] || [ -z $2 ]; then
    echo "Please provide your USERNAME and PASSWORD as command line arguments."
else
    echo "Attempting login ..."
    res=$(curl -X POST $BASE_URL/snackend/user/login -F "username=$1" -F "password=$2")
    if ( echo $res | grep -Eq \{.*\} ); then
	echo $res
	echo "... done. WARNING: Authorization token could not be obtained."
    else
	echo "AUTH_TOKEN=$res" > $TOKEN_FILE
	echo "... done. Authorization token has been stored @'$TOKEN_FILE'"
    fi
fi
