# PuckCall
Calling with RasPi, Puck.JS and Nexmo Websockets


This project demonstrates how to initiate an outbound call via Nexmo triggered from a puck.js button, the call will then be connected to the machine that is running the code via a websocket for a 2 way audio call, this could be used for example as a fall alarm, a one button dial into a conferance call in a meeting room or as a kiosk within a public environment.


The code runs on either a Raspberry Pi 3 with an attached USB speaker and Mic or on a Macbook with BLE,
Note: I have had varible results using the Pi Zero W, I think it struggles to be stable.


## Installation
Clone this repo to your local machine, if you are running on a Pi then execute setup.sh as root to install the required packages.
Then just run 
`npm install`

## Configuration
You will need a nexmo application created for this to use, don't worry about the incomming answer_url and event_url parameters as it only uses outbound calls.
You need to save the private key in the project folder as `private.key` and add the application ID to the config.json file
You will also need to set the `callerid` to a nexmo number on your account and the `dest` to be the phone number you want to be called both of these are also in config.json

## Puck Setup
You will need a puck.js device, goto https://espruino.com/ide (using Chrome) and connect to the puck using web bluetooth, then flash the puck with the `puck.js` code in the `puck` folder.

If this was successful then when you press the button on the puck the green light should come on for 2 seconds.

## Running
Just type `node index.js` to run the application (on a Pi this needs to run as root)
After a few momemnts you will see a few things logged to the console (the order may vary)

```
App listening on port 8000!
Ngrok connected as:  https://7903af6d.eu.ngrok.io
f386172e29ed -46 0

````

This confirms that the web server is running on port 8000
You have connected to ngrok for a tunnel to expose the server to the internet
The final line is showing that the signal from your puck is being recieved, the first string is a random device id, the next is the RSSI (in dBm) and the 0 is the standbystate.

Now press the button on the puck, the light should go green and you will see the puck status line with a `10` instead of `0` follwed by confirmation that it is calling your configured number.