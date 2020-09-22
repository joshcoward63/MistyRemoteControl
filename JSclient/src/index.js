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
