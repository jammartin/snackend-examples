#!/usr/bin/env bash

EXEC_PATH=/home/pi/git/snackend-examples/picSe/utils

source $EXEC_PATH/base_url # contains BASE_URL
source $EXEC_PATH/auth_token # contains AUTH_TOKEN

PICTURE_DIR=/home/pi/camera

DATE=$(date +"%Y-%m-%d_%H%M")

echo "Photographing ..." 
raspistill -n -o $PICTURE_DIR/$DATE.jpg  
echo "... done. Saved @'$PICTURE_DIR/$DATE.jpg'." 

TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S.000Z" -u)
echo "Uploading to '$BASE_URL' ..."
curl -X POST $BASE_URL/snackend/pics/create -F "file=@$PICTURE_DIR/$DATE.jpg" -F "date=$TIMESTAMP" -H "Authorization: bearer $AUTH_TOKEN"
echo "... done."
