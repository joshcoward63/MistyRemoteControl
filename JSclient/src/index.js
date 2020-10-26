//This file when ran opens up a page in the browser where user can remotely control Misty
import './index.css'
// import { withWaveHeader, appendBuffer } from './wave-heard';
//imports the socket.io client
const io = require("socket.io-client"),
//Creates a client that connects ot server at the specified address
client = io.connect("http://192.168.0.14:5507");

// var audioContext = new (window.AudioContext || window.webkitAudioContext)();
// var count = 0;
// var startTime;
var robots = {}
var robots2 = {}
var robotSelect = document.getElementById("mySelection");
var robotCount = 0;
client.on("getInfo", function(info){
  var newInfo = JSON.parse(info);
  var sid = newInfo.SID;
  
  robots[sid] = newInfo;
  robots2[robotCount] = {"Name": newInfo["Name"], "SID": sid};
  robotCount++;
  var newOption = document.createElement("option");
  newOption.text = newInfo["Name"];
  robotSelect.options.add(newOption,1);
  
})

client.on("robotDisconnect", function(info){
    for (var i=0; i<robotSelect.length; i++) {
      if (robotSelect.options[i].text == robots[info].Name)
          robotSelect.remove(i);
  }
  delete robots[info];
})

console.log("hey");
//Changes the current robot
var currentRobot; 
var currentRobotSID;
robotSelect.onchange = function(){
  currentRobot = robotSelect.options[robotSelect.selectedIndex].text;
  console.log(currentRobot);
  console.log(Object.keys(robots2).length)
  for(var i = 0; i< Object.keys(robots2).length; i++){
    if(robots2[i].Name == currentRobot){
      currentRobotSID = robots2[i].SID;
      client.emit("selectedRobot",currentRobotSID);  
      return;
    }     
  }
  client.emit("selectedRobot",null);        

}



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

//head motion
var lookUp = document.getElementById("lookUp");
var lookLeft = document.getElementById("lookLeft");
var lookRight = document.getElementById("lookRight");
var lookDown = document.getElementById("lookDown");
var currentPitch = 0;
var currentYaw = 0

//Checks if pitch value is in between bounds
function checkPitch(){
  var bool;
  if(currentPitch > 26){
    bool = false;
    console.log("Maximum pitch reached")
    
  }
  else if(currentPitch < -40){
    bool = false
    console.log("Minimum pitch reached.")
  }
  else{
    bool = true;
  }
  return bool;
}

//Checks if yaw value is in between bounds
function checkYaw(){
  var bool;
  if(currentYaw > 70){
    bool = false;
    console.log("Maximum yaw reached")
    
  }
  else if(currentYaw < -70){
    bool = false
    console.log("Minimum yaw reached.")
  }
  else{
    bool = true;
  }
  return bool;
}


var timeout = null;
lookUp.addEventListener("mousedown", mouseDownHandler);
lookUp.addEventListener("mouseup", mouseUpHandler);
lookUp.onclick = lookUpFunc();
lookDown.addEventListener("mousedown", mouseDownHandler1);
lookDown.addEventListener("mouseup", mouseUpHandler);
lookDown.onclick = lookDownFunc();
lookLeft.addEventListener("mousedown", mouseDownHandler2);
lookLeft.addEventListener("mouseup", mouseUpHandler);
lookLeft = lookLeftFunc();
lookRight.addEventListener("mousedown", mouseDownHandler3);
lookRight.addEventListener("mouseup", mouseUpHandler);
lookRight.onclick = lookRightFunc();

function mouseUpHandler(event) {
  clearInterval(timeout);
}
function mouseDownHandler(event) {
  lookUpFunc();
  timeout = setInterval(lookUpFunc, 250);  
}
function mouseDownHandler1(event) {
  lookDownFunc();
  timeout = setInterval(lookDownFunc, 250);
  
}function mouseDownHandler2(event) {
  lookLeftFunc();
  timeout = setInterval(lookLeftFunc, 250);
  
}function mouseDownHandler3(event) {
  lookRightFunc();
  timeout = setInterval(lookRightFunc, 250);  
}


function lookUpFunc() {
  currentPitch = currentPitch - 1;
  if(checkPitch()){
    client.emit("moveHead", {"Pitch": currentPitch, "Roll": 0, "Yaw": currentYaw, "Velocity": 100});
  }
  else{
    currentPitch = currentPitch + 1;
  }
}

function lookDownFunc() {
  currentPitch = currentPitch + 5;
  if(checkPitch()){
    client.emit("moveHead", {"Pitch": currentPitch, "Roll": 0, "Yaw": currentYaw, "Velocity": 100});
  }
  else{
    currentPitch = currentPitch - 5;
  }
}

function lookRightFunc() {
  currentYaw = currentYaw - 5;
  if(checkYaw()){
    client.emit("moveHead", {"Pitch": currentPitch, "Roll": 0, "Yaw": currentYaw, "Velocity": 100});
  }
  else{
    currentYaw = currentYaw + 5;
  }
}

function lookLeftFunc() {
  currentYaw = currentYaw + 5;
  if(checkYaw()){
    client.emit("moveHead", {"Pitch": currentPitch, "Roll": 0, "Yaw": currentYaw, "Velocity": 100});
  }
  else{
    currentYaw = currentYaw - 5;
  }
}


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

var buf;
var context = new AudioContext();

function playByteArray(byteArray){
  
  var arrayBuffer = new ArrayBuffer(byteArray.length);
  var bufferView = new Uint8Array(arrayBuffer);
  for(var i = 0; i < byteArray.length; i++){

    bufferView[i] = byteArray[i];
  }
  context.decodeAudioData(arrayBuffer, function(buffer){
    buf = buffer;
    play();
  });
}

function play(){
  var source = context.createBufferSource();
  source.buffer = buf;
  source.connect(context.destination);

  source.start(0);
}

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
      // var array = Array.from(data);
      // var arrayBufferView2 = new Uint8Array(array);
      // var blob2 = new Blob( [arrayBufferView2], {type: "audio/mp3" })
      var audioSpot = document.getElementById("audioSpot");
      audioSpot.setAttribute("src", data)
      
      audioSpot.play()

      // document.getElementById("audioSpot").setAttribute("src",window.URL.createObjectURL(blob2));
      // console.log("audiooooo");
      // var audioArray = new Uint8Array(data.buffer);
      // console.log(String.fromCharCode.apply(null, new Uint8Array(data)))
      // console.log(typeof audioArray)
      // playByteArray(audioArray.buffer);
      // console.log("Pleaaseeee Playyyyy");
      // console.log(data)

      // var data1 = data.split('base64,')[1];
      // console.log(typeof(data1));
      // var decodedData = atou(data1);
      // var snd = Sound("data:audio/wav;base64,", + decodedData);
      // snd.play()
    })
  }
  else{
    document.getElementById("streamVideo").innerText = "Start Video Stream"
    client.emit("requestVideo", {"Bool": "False"})
  }
}
function atou(b64) {
  return decodeURIComponent(escape(atob(b64)));
}
var Sound = (function () {
    var df = document.createDocumentFragment();
    return function Sound(src) {
        var snd = new Audio(src);
        df.appendChild(snd); // keep in fragment until finished playing
        snd.addEventListener('ended', function () {df.removeChild(snd);});
        snd.play();
        return snd;
    }
}());
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
            console.log(typeof(data))
            console.log(String.fromCharCode.apply(null, new Uint8Array(data)))
            masterOutput.sampleIndex++;
            masterOutput.currentSeconds = (masterOutput.sampleIndex + masterOutput.currentSamplesOffset) / masterOutput.sampleRate;

            masterOutput.channels[0][masterOutput.sampleIndex] =  new Uint8Array(data);
  
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
  





  

