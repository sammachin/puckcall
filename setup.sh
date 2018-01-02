#! /bin/bash

apt-get update

apt-get install git
apt-get install libasound2-dev
apt-get install npm
apt-get install mpg123
npm install -g node-gyp


echo "defaults.pcm.card 1" >>  /etc/asound.conf
echo "defaults.ctl.card 1" >> /etc/asound.conf
   
   
