/*This file when ran opens up a page in the browser where user can remotely control Misty*/
import './index.css'

const config = require(".\\config.json");

var serverIp = config["server_ip"] + ":" + config["server_port"];
/*imports the socket.io client*/
const io = require("socket.io-client"),
/*Creates a client that connects ot server at the specified address*/
client = io.connect(serverIp);
var robotList = {};
var robotSelect = document.getElementById("mySelection");
var robotCount = 0;

client.on("robotInfoBrowser", function(robotsInfo, serverRobotCount){
  var newOption = document.createElement("option");
  robotCount = serverRobotCount;
  for(var i = 1; i <= robotCount; i++){
    robotList[i] = robotsInfo[i];
    if(robotList[i] != null){
      newOption.text = robotsInfo[i].Name;
      robotSelect.options.add(newOption,i);
    } 
  }  
})

/*Removes robot from dict on disconnect and updates robot count*/
client.on("robotDisconnect", function(robotNumber){
    for (var i=0; i <= robotCount; i++) {
      if (robotSelect.options[i].text == robotList[robotNumber].Name){
          robotSelect.remove(i);
      }
  }
  delete robotList[robotNumber];
  console.log("robot list disconnect: ", robotList);
})

/*Changes the current robot*/
var currentRobot; 
var currentRobotSID;
robotSelect.onchange = function(){
  currentRobot = robotSelect.options[robotSelect.selectedIndex].text;
  console.log(currentRobot);
  for(var i = 1; i<= Object.keys(robotList).length; i++){
    console.log("robot list: ", robotList);
    if(robotList[i].Name == currentRobot){
      currentRobotSID = robotList[i].SID;
      client.emit("selectedRobot",currentRobotSID);  
      return;
    }     
  }
}

/*The following buttons change the color of Misty when clicked on in the browser*/
var greenButton = document.getElementById("greenButton");
var blueButton = document.getElementById("blueButton");
var redButton = document.getElementById("redButton");
var clearButton = document.getElementById("clearButton");

/*Left arm buttons*/
var raiseLeftArm = document.getElementById("raiseLeftArm");
var pointLeftArm = document.getElementById("pointLeftArm");
var lowerLeftArm = document.getElementById("lowerLeftArm");

/* Controls right arm motion*/
var raiseRightArm = document.getElementById("raiseRightArm");
var pointRightArm = document.getElementById("pointRightArm");
var lowerRightArm = document.getElementById("lowerRightArm");

/*head motion*/
var lookUp = document.getElementById("lookUp");
var lookLeft = document.getElementById("lookLeft");
var lookRight = document.getElementById("lookRight");
var lookDown = document.getElementById("lookDown");

var currentPitch = 0;
var currentYaw = 0;

/*Checks if pitch value is in between bounds*/
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

/*Checks if yaw value is in between bounds*/
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

/*Event listeners for Robot head movement*/
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

/*The following functions control head movement when buttons are held down*/
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

/*The following functions send head postion updates to the robot as buttons are presses*/
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
  currentPitch = currentPitch + 1;
  if(checkPitch()){
    client.emit("moveHead", {"Pitch": currentPitch, "Roll": 0, "Yaw": currentYaw, "Velocity": 100});
  }
  else{
    currentPitch = currentPitch - 1;
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

/*Change color to green*/
greenButton.onclick = function(){
  client.emit("color",{"red": 0,"green": 255,"blue": 0});
}
/*Change color to blue*/
blueButton.onclick = function(){
  client.emit("color",{"red": 0,"green": 0,"blue": 255});
}
/*Change color to red*/
redButton.onclick = function(){
  client.emit("color",{"red": 255,"green": 0,"blue": 0});
}
/*Change color to original*/
clearButton.onclick = function(){
  client.emit("color",{"red": 255,"green": 255,"blue": 255});
}

/* Controls left arm motion*/
raiseLeftArm.onclick = function(){
  client.emit("arm",{"Arm": "left" , "Position": -90, "Velocity": 100});
}
pointLeftArm.onclick =function(){
  client.emit("arm", {"Arm":"left", "Position": 0, "Velocity": 100});
}
lowerLeftArm.onclick =function(){
  client.emit("arm", {"Arm":"left", "Position": 90, "Velocity": 100});
}

/* Controls right arm motion*/
raiseRightArm.onclick = function(){
  client.emit("arm",{"Arm": "right" , "Position": -90, "Velocity": 100});
}
pointRightArm.onclick =function(){
  client.emit("arm", {"Arm":"right", "Position": 0, "Velocity": 100});
}
lowerRightArm.onclick =function(){
  client.emit("arm", {"Arm":"right", "Position": 90, "Velocity": 100});
}

/*Sends a message for Misty to speak*/
var textButton = document.getElementById("textButton");
var textBox =  document.getElementById("textMessage")
textButton.onclick = function(){
  var text = textBox.value;
  textBox.value = "";
  client.emit("recievedText", text);
}

/*Streams video to browser on button press*/
var streamVideo = document.getElementById("streamVideo");
streamVideo.onclick = function(){
  if(document.getElementById("streamVideo").innerText === "Start Video Stream"){
    document.getElementById("streamVideo").innerText = "Stop Video Stream";
    client.emit("requestVideo");  
  }
  else{
    document.getElementById("streamVideo").innerText = "Start Video Stream";
    client.emit("stopVideo");
  }
}
client.on("getVideo", function streamvid(data){   
  var arrayBufferView = new Uint8Array( data );
  var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
  var urlCreator = window.URL || window.webkitURL;
  var imageUrl = urlCreator.createObjectURL( blob );
  document.getElementById("videoSpot").setAttribute("src", imageUrl);     
})


/*Initiates audio stream to the python-co-client*/
var streamAudio = document.getElementById("streamAudio");
  streamAudio.onclick = function(){
    if(document.getElementById("streamAudio").innerText === "Start Audio Stream"){
      document.getElementById("streamAudio").innerText = "Stop Audio Stream";
      client.emit("requestAudio");    
    
    }else{
      document.getElementById("streamAudio").innerText = "Start Audio Stream"
      client.emit("stopAudio")
    }
}