const express = require('express')
const app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var expressWs = require('express-ws')(app);
var isBuffer = require('is-buffer')

var header = require("waveheader");
var fs = require('fs');
var file;

var tone = require('tonegenerator')

var mic = require('mic');
const Speaker = require('speaker');

var chunkingStreams = require('chunking-streams');
var SizeChunker = chunkingStreams.SizeChunker;
var config = require("./config.json")

var micInstance = mic({
    rate: '16000',
    channels: 1
});

var chunker = new SizeChunker({
    chunkSize: 640 // must be a number greater than zero. 
});

var ngrok = require('ngrok');
var ngrokurl;

ngrok.once('connect', function (url) {
    ngrokurl = url;
    console.log("Ngrok connected as: ", ngrokurl);
});
ngrok.connect({ addr: 8000,
                region: 'eu'});

// Watch for BLE Button events
var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
    } else {
        noble.stopScanning();
    }
});

var lastData = {};
noble.on('discover', function(peripheral) {
    var data = peripheral.advertisement.serviceData;
    lastData[peripheral.id] = lastData[peripheral.id]||{};

    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (lastData[peripheral.id][d.uuid] !== d.data[0]) {
            lastData[peripheral.id][d.uuid] = d.data[0];
            if (d.uuid == "180f"){
                console.log(peripheral.id, peripheral.rssi, d.data[0]);
                if (d.data[0]  > 1){
                    makeCall();
                }
            }
        }
    }
});

var Nexmo = require('nexmo');
var app_id = config.app_id
var nexmo = new Nexmo({
    apiKey: "dummy",
    apiSecret: "dummy",
    applicationId: app_id,
    privateKey: "./private.key",
  });


function makeCall(){
    var url = ngrokurl+"/ncco"
    nexmo.calls.create({
      to: [{
        type: 'phone',
          number: config.dest
      }],
      from: {
        type: 'phone',
          number: config.callerid
      },
      answer_url: [url]
    }, function(resp){
        console.log("Calling",  config.dest );
    });
}



//Serve a Main Page
app.get('/', function(req, res) {
    res.send("Node Websocket");
});


//Serve the NCCO on the /ncco answer URL
app.get('/ncco', function(req, res) {
    var ncco = require('./ncco.json');
    ncco[1]['endpoint'][0]['uri'] = "wss:"+ngrokurl.split(":")[1]+"/socket"
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ncco), 'utf-8');
});


var buf;
function wssend(ws, data){
    if (data.length == 640){
        //console.log(Date.now(), " Sending: ", data.length, " Bytes")
        try {
           ws.send(data);
        }
        catch (e) {
        console.log("Send Error: ", e)
        };
    }
    else{
        //console.log(Date.now(), " Buffering: ", data.length, " Bytes");
        buf += data;
        if (buf.length == 640){
            //console.log(Date.now(), " Sending: ", data.length, " Bytes")
            try {
               ws.send(data);
            }
            catch (e) {
            console.log("Send Error: ", e)
            };
            buf = null;
        }
    }
    
}
    
   


// Handle the Websocket
app.ws('/socket', function(ws, req) {
    console.log("Websocket Connected");
    speaker = new Speaker({
                  channels: 1,          
                  bitDepth: 16,         
                  sampleRate: 16000});
    var micInputStream = micInstance.getAudioStream();
    micInputStream.pipe(chunker);
    setTimeout(function(){  micInstance.start(); }, 2000);
    chunker.on('data', function(chunk) {
        wssend(ws, chunk.data);
    });
    ws.on('message', function(msg) {
     if (isBuffer(msg)) {
         try {
            speaker.write(msg);
         }
         catch (e) {
             console.log("Speaker Error: ", e)
         }
             
     }
     else {
         console.log(msg);
         var tonedata = tone(440, .8, volume = tone.MAX_16, sampleRate = 16000)
         var i,j,sample,chunk = 640;
         for (i=0,j=tonedata.length; i<j; i+=chunk) {
             sample = tonedata.slice(i,i+chunk);
             wssend(ws, sample);
         }
     }
    });
    ws.on('close', function(ws){
      console.log("Websocket Closed");
      speaker.end();
      micInstance.stop()
  })
});

 

app.listen(8000, () => console.log('App listening on port 8000!'))