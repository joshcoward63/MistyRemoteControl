#Running on Misty
import socketio
import requests
import json
import threading
import time
from PIL import Image
from MistyAPI import Robot
from io import BytesIO
import base64

#Creates the client
sio = socketio.Client()


@sio.on('color')
def message(data):
    y = json.loads(data)
    Robot.change_LED(robot,y["red"], y['green'], y['blue'])

@sio.on('arm')
def message2(data):
    y = json.loads(data)
    Robot.move_arm(robot,y["Arm"], y['Position'], y['Velocity'])


@sio.on('requestVideo')
def messageStream(data):
    y = json.loads(data)
        
    while y["Bool"] != "False":
        time.sleep(0.25)
        pic = Robot.take_picture(robot)     
        imgdata = base64.b64decode(pic["base64"])       
        sio.emit("getVideo",imgdata )
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

if __name__=="__main__":
    sio.connect('http://192.168.0.14:5505')
    robot = Robot('192.168.0.7')
    # print("succcess")
    #sio.wait()

