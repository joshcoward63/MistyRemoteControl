//This file when ran opens up a page in the browser where user can remotely control Misty
import './index.css'

//imports the socket.io client
const io = require("socket.io-client"),

//Creates a client that connects ot server at the specified address
client = io.connect("http://192.168.0.14:5503");

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
  client.emit("arm", {"Arm":"left","Positon": 0, "Velocity": 100});
}
lowerLeftArm.onclick =function(){
  client.emit("arm", {"Arm":"left","Positon": 90, "Velocity": 100});
}

raiseRightArm.onclick = function(){
  client.emit("arm",{"Arm": "right" , "Position": -90, "Velocity": 100});
}
pointRightArm.onclick =function(){
  client.emit("arm", {"Arm":"right","Positon": 0, "Velocity": 100});
}
lowerRightArm.onclick =function(){
  client.emit("arm", {"Arm":"right","Positon": 90, "Velocity": 100});
}


var streamVideo = document.getElementById("streamVideo");

streamVideo.onclick = function(){
  if(document.getElementById("streamVideo").innerText === "Start Video Stream"){
    document.getElementById("streamVideo").innerText = "Stop Video Stream";
    client.emit("requestVideo", {"Bool": "True"});
  }
  else{
    document.getElementById("streamVideo").innerText = "Start Video Stream"
  }
}
while(document.getElementById("streamVideo").innerText === "Stop Video Stream"){
  client.on("getVideo", function streamvid(data){
  var y = JSON.stringify(data);
  
  })
}
client.emit("requestVideo", {"Bool": "False"});

  

