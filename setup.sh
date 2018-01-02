#! /bin/bash

apt-get update

apt-get install git libasound2-dev npm mpg123
npm install -g node-gyp

echo "defaults.pcm.card 1" >>  /etc/asound.conf
echo "defaults.ctl.card 1" >> /etc/asound.conf
   
   
