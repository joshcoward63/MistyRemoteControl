//This file creates a Web server
var express = require('express');
var app = express();
global.atob = require("atob");
//Server is listening on port 5507
var server = app.listen(5507);

app.use(express.static('public'));
console.log("Listening on port 5507");

var socket = require('socket.io');

//Starts server 
var io = socket(server);

var clients = {}
var currentRobotSID;

io.sockets.on('connection', newConnection);
 function newConnection(socket){
 	console.log("new connection: " + socket.id);
	  io.to(socket.id).emit("hey", socket.id);
	  clients[socket.id] = null;
	  console.log(JSON.stringify(clients))

	socket.on("getInfo", function getInfo(info){
		info = JSON.stringify(info);
		var sid = info["SID"];
		clients[sid] = info;
		console.log("Getting info", info);
		socket.broadcast.emit("getInfo", info);
	})

	socket.on('disconnecting', function(){			
		socket.broadcast.emit("robotDisconnect", socket.id);
		delete clients[socket.id];	
		console.log("Client list: ", clients);
	})
	socket.on("selectedRobot", function(SID){
		currentRobotSID = SID;
	})
	
 //function looks for a client who sends "color" and then broadcasts the data to all the clients except the one who sent it
 //This function changes the color of Mistys LED
 	socket.on("color", function jsConfig(data){
 		socket.to(currentRobotSID).emit("color", JSON.stringify(data));
 		console.log(JSON.stringify(data));
	 })
	 
	 //Controls movement of arms
	 socket.on("arm", function leftArm(data){
		 socket.to(currentRobotSID).emit("arm",JSON.stringify(data));
		 console.log(JSON.stringify(data))
	 })

	 socket.on("requestVideo", function requestVideo(data){
		 socket.to(currentRobotSID).emit("requestVideo", JSON.stringify(data));
		 console.log("Requested Video");
	 })

	 socket.on("getVideo", function getVideo(data){
		 socket.broadcast.emit("getVideo", data);
		 console.log("Getting Video");
	 })
   
	 socket.on("requestAudio", function getAudio(data){
		 socket.to(currentRobotSID).emit("requestAudio", data);
		 console.log("Requested Audio");
	 })

	 socket.on("getAudio", function getAudio(data){
		 socket.broadcast.emit("getAudio", data);
		 console.log("Getting Audio", data);
	 })

	socket.on("moveHead", function moveHead(data){
		socket.to(currentRobotSID).emit("moveHead", JSON.stringify(data));
		console.log(JSON.stringify(data));
	})
 }
