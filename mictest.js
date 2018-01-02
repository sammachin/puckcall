var mic = require('mic');
var chunkingStreams = require('chunking-streams');
var SizeChunker = chunkingStreams.SizeChunker;


var micInstance = mic({
    rate: '16000',
    channels: '1',
    debug: true
});


var chunker = new SizeChunker({
    chunkSize: 640 // must be a number greater than zero. 
});


var micInputStream = micInstance.getAudioStream();
micInputStream.pipe(chunker);
micInstance.start()
chunker.on('data', function(chunk) {
   console.log("Chunk size: ", chunk.data.length);    
});