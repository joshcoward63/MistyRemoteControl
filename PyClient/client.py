"""This Client connects directly to Misty and relays commands between Misty and Nodejs server"""
import socketio
import requests
import json
import threading
import time
from PIL import Image
from MistyAPI import Robot
from io import BytesIO
import base64
import av
from PIL import Image
import io
import numpy as np

#Creates the client
sio = socketio.Client()

#Robot Info
robot_ip = '192.168.0.9'
robot = Robot(robot_ip)
# robot.disable_avstream()
robot.enable_avstream()
robot.stream_av()
name = "White Misty"

#Connects to server
sio.connect('http://192.168.0.8:5000')

next_container = None

#Rotates Misty's head
@sio.on('moveHead')
def message3(data):
    global robot
    y = json.loads(data)
    robot.move_head(y["Pitch"], y["Roll"], y["Yaw"], y["Velocity"])

#Changes Mistys LED color
@sio.on('color')
def message(data):
    global robot
    y = json.loads(data)
    robot.change_LED(y["red"], y['green'], y['blue'])

#Moves Misty's arms
@sio.on('arm')
def message2(data):
    global robot
    y = json.loads(data)
    robot.move_arm(y["Arm"], y['Position'], y['Velocity'])


#Thread writes and AudioFrame to string and send to client
def consumer_thread():
    global next_container
    print("connected, starting stream")
    stream_path = 'rtsp://{}:1936'.format(robot_ip)
    next_container = av.open(stream_path)
    input_stream = next_container.streams.get(audio=0)[0]
    for frame in next_container.decode(input_stream):
        frame.pts = None
        sio.emit('getAudio', frame.to_ndarray().astype(np.float32).tostring())

#Streams Audio to server
@sio.on('requestAudio')
def messageStream2(data):
    t = threading.Thread(target=consumer_thread)
    t.start()  

##Steams video to server
@sio.on('requestVideo')
def messageStream(data):
    global robot

    stream_path = 'rtsp://{}:1936'.format(robot_ip)
    container = av.open(stream_path)

    for frame in container.decode(video=0):
        image = frame.to_image()
        image = image.rotate(270)
        imgByteArr = io.BytesIO()
        image.save(imgByteArr, format='JPEG')
        imgByteArr = imgByteArr.getvalue()
        sio.emit("getVideo", imgByteArr)


#Recieves text and converts it to speech for Misty
@sio.on("text")
def textToSpeech(text):
    global robot
    print(text)
    robot.say(text)

#Sends Individual Robot info
@sio.on("robotInfo")
def message4(sid):
    info = {"SID": sid, "Name": name, "IP": robot_ip}
    print(info)
    sio.emit("getInfo", info)

# When the socket connects    
@sio.event
def connect():
    print("I'm connected!")

# When the socket has an error
@sio.event
def connect_error():
    print("The connection failed!")

# When the socket disconnects
@sio.event
def disconnect():
    print("I'm disconnected!")
    
