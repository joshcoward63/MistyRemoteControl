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
        time.sleep(0.5)
        pic = Robot.take_picture(robot)     
        
        imgdata = base64.b64decode(pic["base64"])    
        filename = "image.jpg"
        with open(filename, 'wb') as f:
            f.write(imgdata)            
        sio.emit("getVideo", {"KEY": pic["base64"]})
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
    sio.connect('http://192.168.0.14:5503')
    robot = Robot('192.168.0.7')
    # print("succcess")
    #sio.wait()

# x = Robot.take_picture(robot)
# imgdata = base64.b64decode(x["base64"])
# filename = 'some_image.jpg'  # I assume you have a way of picking unique filenames
# with open(filename, 'wb') as f:
#     f.write(imgdata)

# print("done")
# while True:
#     time.sleep(2)
#     sio.emit("boobs", {"Person": "john"})


