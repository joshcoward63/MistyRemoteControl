//This file when ran opens up a page in the browser where user can remotely control Misty
import './index.css'
import { withWaveHeader, appendBuffer } from './wave-heard';
//imports the socket.io client
const io = require("socket.io-client"),
//Creates a client that connects ot server at the specified address
client = io.connect("http://192.168.1.135:5505");

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var count = 0;
var startTime;

//The following buttons change the color of Misty when clicked on in the browser

var greenButton = document.getElementById("greenButton");
var blueButton = document.getElementById("blueButton");
var redButton = document.getElementById("redButton");
//left arm motion
var raiseLeftArm = document.getElementById("raiseLeftArm");
var pointLeftArm = document.getElementById("pointLeftArm");
var lowerLeftArm = document.getElementById("lowerLeftArm");
//right arm motion
var raiseRightArm = document.getElementById("raiseRightArm");
var pointRightArm = document.getElementById("pointRightArm");
var lowerRightArm = document.getElementById("lowerRightArm");
//Change color to green
greenButton.onclick = function(){
  client.emit("color",{"red": 0,"green": 255,"blue": 0});
}
//Change color to blue
blueButton.onclick = function(){
  client.emit("color",{"red": 0,"green": 0,"blue": 255});
}
//Change color to red
redButton.onclick = function(){
  client.emit("color",{"red": 255,"green": 0,"blue": 0});
}

raiseLeftArm.onclick = function(){
  client.emit("arm",{"Arm": "left" , "Position": -90, "Velocity": 100});
}
pointLeftArm.onclick =function(){
  client.emit("arm", {"Arm":"left", "Position": 0, "Velocity": 100});
}
lowerLeftArm.onclick =function(){
  client.emit("arm", {"Arm":"left", "Position": 90, "Velocity": 100});
}

raiseRightArm.onclick = function(){
  client.emit("arm",{"Arm": "right" , "Position": -90, "Velocity": 100});
}
pointRightArm.onclick =function(){
  client.emit("arm", {"Arm":"right", "Position": 0, "Velocity": 100});
}
lowerRightArm.onclick =function(){
  client.emit("arm", {"Arm":"right", "Position": 90, "Velocity": 100});
}


var streamVideo = document.getElementById("streamVideo");


streamVideo.onclick = function(){
  if(document.getElementById("streamVideo").innerText === "Start Video Stream"){
    document.getElementById("streamVideo").innerText = "Stop Video Stream";
    // client.emit("requestVideo", {"Bool": "True"});
    client.emit("requestAudio");
  
    client.on("getVideo", function streamvid(data){   
      // var img = new Image();
      // img.src = data;

      var arrayBufferView = new Uint8Array( data );
      var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL( blob );
    

      document.getElementById("videoSpot").setAttribute("src", imageUrl);
     
    })

    client.on("getAudio", function getAudio(data){
      var array = Array.from(data);
      var arrayBufferView2 = new Uint8Array(array);
      var blob2 = new Blob( [arrayBufferView2], {type: "audio/wav" })
      document.getElementById("audioSpot").setAttribute("src",window.URL.createObjectURL(blob2));
    })
  }
  else{
    document.getElementById("streamVideo").innerText = "Start Video Stream"
    client.emit("requestVideo", {"Bool": "False"})
  }
}

// https://stackoverflow.com/questions/28440262/web-audio-api-for-live-streaming
class MasterOutput {
  constructor(computeSamplesCallback) {
    this.computeSamplesCallback = computeSamplesCallback.bind(this);
    this.onComputeTimeoutBound = this.onComputeTimeout.bind(this);

    this.audioContext = new AudioContext();
    this.sampleRate = this.audioContext.sampleRate;
    this.channelCount = 2;

    this.totalBufferDuration = 5;
    this.computeDuration = 1;
    this.bufferDelayDuration = 0.1;

    this.totalSamplesCount = this.totalBufferDuration * this.sampleRate;
    this.computeDurationMS = this.computeDuration * 1000.0;
    this.computeSamplesCount = this.computeDuration * this.sampleRate;
    this.buffersToKeep = Math.ceil((this.totalBufferDuration + 2.0 * this.bufferDelayDuration) /
      this.computeDuration);

    this.audioBufferSources = [];
    this.audioBufferDatas = [];
    this.expiredAudioBuffers = [];
    this.computeSamplesTimeout = null;
  }

  startPlaying() {
    if (this.audioBufferSources.length > 0) {
      this.stopPlaying();
    }

    //Start computing indefinitely, from the beginning.
    let audioContextTimestamp = this.audioContext.getOutputTimestamp();
    this.audioContextStartOffset = audioContextTimestamp.contextTime;
    this.lastTimeoutTime = audioContextTimestamp.performanceTime;
    for (this.currentBufferTime = 0.0; this.currentBufferTime < this.totalBufferDuration;
      this.currentBufferTime += this.computeDuration) {
      this.bufferNext();
    }
    this.onComputeTimeoutBound();
  }

  onComputeTimeout() {
    this.bufferNext();
    this.currentBufferTime += this.computeDuration;

    //Readjust the next timeout to have a consistent interval, regardless of computation time.
    let nextTimeoutDuration = 2.0 * this.computeDurationMS - (performance.now() - this.lastTimeoutTime) - 1;
    this.lastTimeoutTime = performance.now();
    this.computeSamplesTimeout = setTimeout(this.onComputeTimeoutBound, nextTimeoutDuration);
  }

  bufferNext() {
    this.currentSamplesOffset = this.currentBufferTime * this.sampleRate;

    //Create an audio buffer, which will contain the audio data.
        //Create/Reuse an audio buffer, which will contain the audio data.
      if (this.expiredAudioBuffers.length > 0) {
          //console.log('Reuse');
          this.audioBuffer = this.expiredAudioBuffers.shift();
      } else {
          //console.log('Create');
          this.audioBuffer = this.audioContext.createBuffer(this.channelCount, this.computeSamplesCount,
              this.sampleRate);
      }

    //Get the audio channels, which are float arrays representing each individual channel for the buffer.
    this.channels = [];
    for (let channelIndex = 0; channelIndex < this.channelCount; ++channelIndex) {
      this.channels.push(this.audioBuffer.getChannelData(channelIndex));
    }

    //Compute the samples.
    this.computeSamplesCallback();

    //Creates a lightweight audio buffer source which can be used to play the audio data. Note: This can only be
    //started once...
    let audioBufferSource = this.audioContext.createBufferSource();
    //Set the audio buffer.
    audioBufferSource.buffer = this.audioBuffer;
    //Connect it to the output.
    audioBufferSource.connect(this.audioContext.destination);
    //Start playing when the audio buffer is due.
    audioBufferSource.start(this.audioContextStartOffset + this.currentBufferTime + this.bufferDelayDuration);
    while (this.audioBufferDatas.length >= this.buffersToKeep) {
      this.expiredAudioBuffers.push(this.audioBufferDatas.shift().buffer);
    }
    this.audioBufferDatas.push({
        source: audioBufferSource,
        buffer: this.audioBuffer
    });
  }

  stopPlaying() {
    if (this.audioBufferDatas.length > 0) {
      for (let audioBufferData of this.audioBufferDatas) {
          audioBufferData.source.stop();
          this.expiredAudioBuffers.push(audioBufferData.buffer);
      }
      this.audioBufferDatas = [];
      clearInterval(this.computeSamplesTimeout);
      this.computeSamplesTimeout = null;
    }
  }
}



  var streamAudio = document.getElementById("streamAudio");

  streamAudio.onclick = function(){
    if(document.getElementById("streamAudio").innerText === "Start Audio Stream"){
      document.getElementById("streamAudio").innerText = "Stop Audio Stream";
      client.emit("requestAudio", {"Bool": "True"});

        let masterOutput = new MasterOutput(function() {
          //Populate the audio buffer with audio data.
          this.currentSeconds = 0;
          this.frequency = 220.0;
          this.sampleIndex = 0

        });

        
        masterOutput.startPlaying();

        client.on("getAudio", function streamaud(data) {   

          while ( masterOutput.sampleIndex <= masterOutput.computeSamplesCount) {

            masterOutput.sampleIndex++;
            masterOutput.currentSeconds = (masterOutput.sampleIndex + masterOutput.currentSamplesOffset) / masterOutput.sampleRate;

            masterOutput.channels[0][masterOutput.sampleIndex] =  new Uint8Array( data );
  
            //Copy the right channel from the left channel.
            masterOutput.channels[1][masterOutput.sampleIndex] = masterOutput.channels[0][masterOutput.sampleIndex];

   
           }
        });
      
    
      }
    else{
      document.getElementById("streamAudio").innerText = "Start Audio Stream"
      client.emit("requestAudio", {"Bool": "False"})
    }


}
  





  

