/*
*This is a socket.io client that communicates to Misty
*/
var request =  require('request'); 
var robot_ip = "192.168.0.9";
var name = "White Misty";
const io = require("socket.io-client"),
client = io.connect("http://192.168.0.14:5507");
var ffmpeg = require('child_process').spawn("ffmpeg", [
    "-re",
    "-y",
    "-i",
    "rtsp://"+robot_ip+":1936",
    "-preset",
    "ultrafast",
    "-f",
    "mjpeg",
    "pipe:1"
  ]);
export class Robot {
    constructor(ip) {
        this.ip = ip;
    }
    change_LED(red, green, blue) {
        var body = '{"red":' + red +', "green":' + green + ', "blue":' + blue + '}';
        // request.post({url:'http://' + this.ip + '/api/led', body: body});
        Promise.race([
            fetch('http://' + this.ip + '/api/Led', {
            method: 'POST',
            body: body
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ])
        .then(response => response.json())
        .then(jsonData => console.log(jsonData))        
    }

    enable_avstream(){
        Promise.race([
            fetch('http://' + this.ip + '/api/services/avstreaming/enable', {
            method: 'POST'
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ])
    }

    disable_avstream(){
        Promise.race([
            fetch('http://' + this.ip + '/api/avstreaming/stop', {
            method: 'POST'
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ])
    }

    stream_av(){
        Promise.race([
            fetch('http://' + this.ip + '/api/avstreaming/start', {
            method: 'POST',
            body: '{"URL": "rtspd:1936", "Width": 640, "Height": 480, "Framerate": 30}'
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ])
    }
    
}


var robot = new Robot(robot_ip);
robot.enable_avstream();
robot.stream_av();
client.on('color', function(data){
    console.log("hey");

    var x = JSON.parse(data);
    robot.change_LED(x["red"], x["green"], x["blue"]);
})

client.on("hey", function(SID){
    console.log(SID);
    var sid = SID;
    var info = {"SID": SID, "Name": name, "IP": robot_ip};
    client.emit("getInfo", info);
    console.log(info);
})


ffmpeg.stdout.on('requestVideo', function (data) {
    var frame = new Buffer(data).toString('base64');
    client.emit('getVideo',frame);
  });