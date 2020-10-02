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
# import pyaudio
import av
from PIL import Image
import io
import wavio

import cv2


#Creates the client
sio = socketio.Client()
robot_ip = '192.168.0.5'
robot = Robot(robot_ip)
# robot.disable_avstream()
robot.enable_avstream()
robot.stream_av()

sio.connect('http://192.168.0.14:5505')


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


@sio.on('requestAudio')
def messageStream2(data):

    stream_path = 'rtsp://{}:1936'.format(robot_ip)
    container = av.open(stream_path)
    input_stream = container.streams.get(audio=0)[0]

    # output_container = av.open('live_stream.mp3', 'w')
    # output_stream = output_container.add_stream('mp3')

    for frame in container.decode(input_stream):
        frame.pts = None
        frame.to_ndarray() # <-- this needs to be sent to the jsserver->client to play the audio in the browser\

        #Its a mess right now
        # print(str(type(frame.to_ndarray())) + "\n" + str(type(frame)))
        # wavio.write("audio.wav", frame.to_ndarray(), 22050, sampwidth=3)
        # sio.emit("getVideo", "audio.wav")
        
        # for packet in output_stream.encode(frame):
            # output_container.mux(packet)

    # for packet in output_stream.encode(None):
        # output_container.mux(packet)

    # output_container.close()  

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

def encode_audio(audio):
    audio_content = audio.read()
    return base64.b64decode(audio_content)