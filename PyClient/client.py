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
from PIL import Image

import cv2


#Creates the client
sio = socketio.Client()
robot_ip = '192.168.1.137'
robot = Robot(robot_ip)
# robot.disable_avstream()
robot.enable_avstream()
robot.stream_av()
# player=vlc.MediaPlayer()
# cap = cv2.VideoCapture('rtsp://{}:1936'.format(robot_ip))

# while(cap.isOpened()):
#     ret, frame = cap.read()
#     print(type(frame))
#     cv2.imshow('frame', frame)
#     if cv2.waitKey(20) & 0xFF == ord('q'):
#         break
# cap.release()
# cv2.destroyAllWindows()

sio.connect('http://192.168.1.132:5505')


@sio.on('color')
def message(data):
    global robot
    y = json.loads(data)
    robot.change_LED(y["red"], y['green'], y['blue'])

@sio.on('arm')
def message2(data):
    global robot
    y = json.loads(data)
    robot.move_arm(y["Arm"], y['Position'], y['Velocity'])


@sio.on('requestVideo')
def messageStream(data):
    global robot
    y = json.loads(data)

    cap = cv2.VideoCapture('rtsp://{}:1936'.format(robot_ip))

    while(cap.isOpened()):
        ret, image = cap.read()
        retval, buffer = cv2.imencode('.jpg', image)
        # imgdata = base64.b64encode(buffer)
        # frame = Image.fromarray(image)
        sio.emit("getVideo", buffer.tobytes())
        # cv2.imshow('frame', image)
        # if cv2.waitKey(20) & 0xFF == ord('q'):
        #     break
    # cap.release()
    # cv2.destroyAllWindows()
        
    # while y["Bool"] != "False":
    #     # time.sleep(0.03)
    #     pic = robot.take_picture() 
    #     print(list(pic.keys()))
    #     imgdata = base64.b64decode(pic["base64"])       
    #     sio.emit("getVideo",imgdata)
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

# if __name__=="__main__":
    
    # print("succcess")
    #sio.wait()

