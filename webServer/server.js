;/*This file creates a Nodejs server that listens for command from Misty Client and frontend Web Client*/
const { Console, countReset } = require('console');
var express = require('express');
var app = express();
const fs = require('fs');
let rawdata = fs.readFileSync("./../JSclient/src/config.json");
let config = JSON.parse(rawdata);
// console.log(config);
var serverPort = config["server_port"];
/*Server is listening on port 5000*/
var server = app.listen(serverPort);

app.use(express.static('public'));
console.log("Listening on port " + serverPort);

var socket = require('socket.io');

/*Starts socketio server*/ 
var io = socket(server);

filename = 'log.txt'
fs.writeFile(filename,'timestamp:event:value', function(err){
	if(err) return console.log(err);
})
/*List of connected clients and current selected Robot*/
var clients = {}
var currentRobotSID;
var robots = {};
var robotCount = 0;
io.sockets.on('connection', newConnection);
 function newConnection(socket){
 	console.log("new connection: " + socket.id);
	  io.to(socket.id).emit("robotInfo", socket.id);
	  socket.emit("robotInfoBrowser", robots, robotCount);
	  clients[socket.id] = null;
	  console.log(JSON.stringify(clients))

	socket.on("getInfo", function getInfo(info){
		robotCount++;
		info = JSON.stringify(info);
		clients[socket.id] = info;
		robots[robotCount] = JSON.parse(info);
		socket.broadcast.emit("robotInfoBrowser", robots, robotCount);
		socket.broadcast.emit("getInfo", info);
	})

	socket.on("getRobotInfo", function(){
		socket.emit("robotInfoBrowser", robots, robotCount);
	})

	
	socket.on('disconnecting', function(){	
		var robotNumber;
		var isBot = false;
		for(i = 1; i <= robotCount; i++){
			if(robots[i].SID == socket.id){
				robotNumber = i;
				robotCount--;
				socket.broadcast.emit("robotDisconnect", robotNumber);
				 delete robots[robotNumber];	
				 break;
			}
		}
		delete clients[socket.id];		
	})
	socket.on("selectedRobot", function(SID){
		logToFile(currentTimeDate(), "Current selected Robot", SID);
		currentRobotSID = SID;
	})
	
	/*Sends LED color changes to Misty Client*/
 	socket.on("color", function jsConfig(colorData){
		socket.to(currentRobotSID).emit("color", JSON.stringify(colorData)); 
		var color = ""
		if(colorData["red"] == 255 && colorData["green"] == 255 && colorData["blue"] == 255){
			color = "white";
		}
		if(colorData["red"] = 255){
			color = "red";
		}
		if(colorData["green"] = 255){
			color = "green";
		}
		if(colorData["blue"] = 255){
			color = "blue";
		}
 		logToFile(currentTimeDate(),"Changed LED", color);
	 })
	 
	 /* Sends arm movements to Misty Client*/
	 socket.on("arm", function leftArm(armData){
		 socket.to(currentRobotSID).emit("arm",JSON.stringify(armData));
		 var arm;
		 var armPosition;
		 if(armData["Arm"] == "left"){
			 arm = "Left";
		 }
		 else{
			 arm = "Right";
		 }
		if(armData["Positon"] > 0){
			armPosition = "lower";
		}
		if(armData["Positon"] < 0){
			armPosition = "raise";
		}
		if(armData["Positon"] == 0){
			armPosition = "point";
		}
		logToFile(currentTimeDate(),arm + " Arm", armPosition);		 	
	 })

	 /*Sends request for video to Misty Client*/
	 socket.on("requestVideo", function requestVideo(data){
		 socket.to(currentRobotSID).emit("requestVideo", JSON.stringify(data));
		 logToFile(currentTimeDate(), "Video", "Playing");
	 })
	 /*Recieves video and send it out to frontened*/
	 socket.on("getVideo", function getVideo(data){
		 socket.broadcast.emit("getVideo", data);
	 })

	/*Sends request to stop video stream from Misty Client*/
	socket.on("stopVideo", function stopVideo(data){
		socket.to(currentRobotSID).emit("stopVideo", data);
		logToFile(currentTimeDate(), "Video", "Stopped");
	})
   
	 /*Sends request for audio to Misty Client*/
	 socket.on("requestAudio", function getAudio(data){
		 socket.to(currentRobotSID).emit("requestAudio", data);
		 logToFile(currentTimeDate(), "Audio", "Playing");
	 })

	/*Sends request to stop audio stream from Misty Client*/
	socket.on("stopAudio", function stopAudio(data){
		socket.to(currentRobotSID).emit("stopAudio", data);
		logToFile(currentTimeDate(), "Audio", "Stopped");
	})

	 /*Recieves audio and send it out to frontened*/
	 socket.on("getAudio", function getAudio(data){
		 socket.broadcast.emit("getAudio", data);
	 })
	/*Sends head movements to Misty client*/
	socket.on("moveHead", function moveHead(headData){
		socket.to(currentRobotSID).emit("moveHead", JSON.stringify(headData));
		logToFile(currentTimeDate(), "Head postion changed", headData);
	})

	socket.on("recievedText", function sendText(text){
		logToFile(currentTimeDate(),"SPTT Message",text);
		socket.to(currentRobotSID).emit("text",text);
	})
 }
 
function logToFile(timestamp, event, value){
	var dataEntry = "\n" + timestamp + " : " + event + " : " +  value ;
	fs.appendFile(filename, dataEntry, function(err){
		if(err) throw err;
	});
}

function currentTimeDate(){
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + "." + today.getMilliseconds();
	var dateTime = date+' '+time;
	return dateTime
}