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
from collections import deque
import numpy as np

#Loads config file
with open("./../JSclient/src/config.json", 'r') as file:
    config =  json.load(file)

#Creates the client
sio = socketio.Client()

#Robot Info
robot_ip = config["robot_ip"]
robot = Robot(robot_ip)

# robot.enable_avstream()
# robot.stream_av()

name = config["robot_name"]
server_ip = "http://" + config["server_ip"] + ":" + config["server_port"]
#Connects to server
sio.connect(server_ip)
queue = deque(maxlen=1)
next_container = None
run_audio = False
run_video = False
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
def audio_thread():
    global next_container
    global run_audio
    run_audio = True
    
    print("connected, starting stream")
    stream_path = 'rtsp://{}:1936'.format(robot_ip)
    next_container = av.open(stream_path)
    input_stream = next_container.streams.get(audio=0)[0]
    for frame in next_container.decode(input_stream):
        frame.pts = None
        sio.emit('getAudio', frame.to_ndarray().astype(np.float32).tostring())
        if not run_audio: break
            
def video_thread():
    global queue
    while True:
        if len(queue) == 0:
            time.sleep(0.25)
            continue
        frame = queue.popleft()
        image = frame.to_image()
        image = image.rotate(270)
        imgByteArr = io.BytesIO()
        image.save(imgByteArr, format='JPEG')
        imgByteArr = imgByteArr.getvalue()
        sio.emit("getVideo", imgByteArr)
    # robot.stream_av()
    
t = threading.Thread(target=video_thread)
t.start()  

#Stops Audio stream to server
@sio.on('stopAudio')
def stopAudioStream(data):
    global run_audio
    run_audio = False
    # robot.disable_avstream()
    
#Streams Audio to server
@sio.on('requestAudio')
def messageStream2(data):
    # robot.stream_av()
    t = threading.Thread(target=audio_thread)
    t.start()  

##Steams video to server
@sio.on('requestVideo')
def messageStream(data):
    global queue
    global run_video
    run_video = True
    stream_path = 'rtsp://{}:1936'.format(robot_ip)
    container = av.open(stream_path)
    for frame in container.decode(video=0):
        queue.append(frame)
        if not run_video: break

#Stops Video stream to server
@sio.on('stopVideo')
def stopVideoStream(data):
    global run_video
    run_video = False
    # robot.disable_avstream()

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
