#Running on Misty
import socketio
import requests
import json
import threading
import time
from MistyAPI import Robot

#Creates the client
sio = socketio.Client()


@sio.on('color')
def message(data):
    y = json.loads(data)
    Robot.change_LED(robot,y["red"], y['green'], y['blue'])

@sio.on('leftArm')
def message2(data):
    y = json.loads(data)
    Robot.move_arm(robot,y["Arm"], y['Position'], y['Velocity'])

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
    robot = Robot('192.168.0.5')
    # print("succcess")
    #sio.wait()


