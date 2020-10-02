//This file when ran opens up a page in the browser where user can remotely control Misty
import './index.css'

//imports the socket.io client
const io = require("socket.io-client"),

//Creates a client that connects ot server at the specified address
client = io.connect("http://192.168.0.14:5505");

//The following buttons change the color of Misty when clicked on in the browser
console.log("hello");
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
  
    console.log("first");
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
  





  

