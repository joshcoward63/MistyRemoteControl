;/*This file creates a Nodejs server that listens for command from Misty Client and frontend Web Client*/
const { Console } = require('console');
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
		console.log("Robot count:" , robotCount)
		socket.broadcast.emit("robotInfoBrowser", robots, robotCount);
		console.log("robot info:", robots);
		console.log("Getting info", info);
		socket.broadcast.emit("getInfo", info);
	})

	socket.on("getRobotInfo", function(){
		console.log(robots);
		socket.emit("robotInfoBrowser", robots, robotCount);
	})

	socket.on('disconnecting', function(){	
		var robotNumber;
		try{
			console.log(robots[1].SID);
			for(i = 1; i <= robotCount; i++){
				console.log(robots[i].SID);

				if(robots[i].SID == socket.id){
					robotNumber = i;
					console.log("robot Number: ", robotNumber);
					robotCount--;
				}
			}	
			console.log("RobotNumber: ", robotNumber);
			socket.broadcast.emit("robotDisconnect", robotNumber);
			delete robots[robotNumber];
			console.log("robotlist: ", robots);
			
		}
		catch{
			console.log("Disconnected Browser")
		}
		delete clients[socket.id];		
		console.log("client list", clients);
	})
	socket.on("selectedRobot", function(SID){
    	console.log(SID);
		currentRobotSID = SID;
	})
	
	/*Sends LED color changes to Misty Client*/
 	socket.on("color", function jsConfig(data){
 		socket.to(currentRobotSID).emit("color", JSON.stringify(data));
 		console.log(currentRobotSID, JSON.stringify(data));
	 })
	 
	 /* Sends arm movements to Misty Client*/
	 socket.on("arm", function leftArm(data){
		 socket.to(currentRobotSID).emit("arm",JSON.stringify(data));
		 console.log(JSON.stringify(data))
	 })

	 /*Sends request for video to Misty Client*/
	 socket.on("requestVideo", function requestVideo(data){
		 socket.to(currentRobotSID).emit("requestVideo", JSON.stringify(data));
		 console.log("Requested Video");
	 })
	 /*Recieves video and send it out to frontened*/
	 socket.on("getVideo", function getVideo(data){
		 socket.broadcast.emit("getVideo", data);
		 console.log("Getting Video");
	 })
   
	 /*Sends request for audio to Misty Client*/
	 socket.on("requestAudio", function getAudio(data){
		 socket.to(currentRobotSID).emit("requestAudio", data);
		 console.log("Requested Audio");
	 })

	 /*Recieves audio and send it out to frontened*/
	 socket.on("getAudio", function getAudio(data){
		 socket.broadcast.emit("getAudio", data);
		 console.log("Getting Audio", data);
	 })
	/*Sends head movements to Misty client*/
	socket.on("moveHead", function moveHead(data){
		socket.to(currentRobotSID).emit("moveHead", JSON.stringify(data));
		console.log(JSON.stringify(data));
	})

	socket.on("recievedText", function sendText(text){
		console.log(text)
		socket.to(currentRobotSID).emit("text",text);
	})
 }
 
