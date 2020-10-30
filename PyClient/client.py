#Running on Misty
import socketio
import requests
import json
import threading
from threading import Thread
import time
from PIL import Image
from MistyAPI import Robot
from io import BytesIO
import base64
import av
import os
import io
import wavio
import sys
import numpy as np
import jsonpickle
import sounddevice as sd
import pygame 
from time import sleep
from playsound import playsound
import wave
from os import path
from pydub import AudioSegment
import ffmpeg
import subprocess
# from pydub.playback import play
import pyaudio
#Creates the client
sio = socketio.Client()
robot_ip = '192.168.0.9'
robot = Robot(robot_ip)
# robot.disable_avstream()
robot.enable_avstream()
robot.stream_av()
name = "White Misty"
sio.connect('http://192.168.0.8:5000')
count = 0

@sio.on('moveHead')
def message3(data):
    global robot
    y = json.loads(data)
    robot.move_head(y["Pitch"], y["Roll"], y["Yaw"], y["Velocity"])


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
def messageStream2():
    stream_path = 'rtsp://{}:1936'.format(robot_ip)
    next_container = av.open(stream_path)
    # global count
    # count+1
    # if count == 2:
    #     robot.disable_avstream()
    #     count = 0
    # def func1():
    subprocess.call(['ffplay', '-i', next_container, '-vn'])

        # return audioData
    
    # def func2():
    #     time.sleep(1)
    #     print("before")   
    #     sio.emit("getAudio", bytes(func1()))
    #     print("after")
    
    # Thread(target=func1).start()
    # Thread(target=func2).start()
    # wf = wave.open("D:\\Downloads\\PinkPanther30.wav", 'rb')
    # sio.emit("getAudio", bytes(next_container))

    #ffmpeg trial 
    # in1 = ffmpeg.input(stream_path)
    # a1 = in1.audio
    # v1 = in1.video
    # joined = ffmpeg.concat(v1,a1).node
    # v2 = joined[0]
    # a2 = joined[1]

    # out = ffmpeg.output(v2,a2, 'out.mp4')
    # out.run_async()
    # audio = a1.decode_audio
    # out = io.BytesIO()
    # audio = decode_audio(stream_path)
    # sio.emit("getAudio", audio)


   

    # next_stream = next_container.streams.get(audio=0)[0]

    # next_container = av.open('live_stream.wav', 'r')
    # next_stream = next_container.streams.get(audio=0)[0]

    # out = io.BytesIO()
    # output_container = av.open(out, 'w', format='wav')
    # output_stream = output_container.add_stream('pcm_s16le', rate=44100)



    # for frame in next_container.decode(next_stream):
    #     frame.pts = None

    #     for packet in output_stream.encode(frame):
    #         output_container.mux(packet)
    # sio.emit("getAudio", packet)

    
# The following can save audio to a playable file
    
    CHUNK = 1026
    input_stream = next_container.streams.get(audio=0)[0]
    output_container = av.open("live_stream.mp3", 'w')
    output_stream = output_container.add_stream('mp3')   

    for frame in next_container.decode(input_stream):
        frame.pts = None
        
        for packet in output_stream.encode(frame):
            output_container.mux(packet)
            # time.sleep(30)
            # dst = "test.wav"
            # print("test1")
            # sound  = AudioSegment.from_mp3("live_stream.mp3")
            # sound.export(dst, format="wav")
            # wf = wave.open(dst, 'rb')
            # print("test1.5")
            # p = pyaudio.PyAudio()
            # stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
            #     channels=wf.getnchannels(),
            #     rate=wf.getframerate(),
            #     output=True)
            # print("test2")
            # data = wf.readframes(CHUNK)
            # while data != '':
            #     stream.write(data)
            #     data = wf.readframes(CHUNK)
        # for packet in output_stream.encode(None):
        #     output_container.mux(packet)
    output_container.close()

# The following can save audio to a playable file
    # input_stream = next_container.streams.get(audio=0)[0]
    # output_container = av.open("live_stream.mp3", 'w')
    # output_stream = output_container.add_stream('mp3')
    # for frame in next_container.decode(input_stream):
    #     frame.pts = None
        
    #     for packet in output_stream.encode(frame):
    #         output_container.mux(packet)
    #     # for packet in output_stream.encode(None):
    #     #     output_container.mux(packet)
    # output_container.close()



    #This is the main one I've been plaing with.
    # input_stream = next_container.streams.get(audio=0)[0]
    # out = io.BytesIO()
    # output_container = av.open(out, 'w', format='wav')
    # output_stream = output_container.add_stream('pcm_s16le', rate = 44100)
    # for frame in next_container.decode(input_stream):
    #     frame.pts = None
        
    #     for packet in output_stream.encode(frame):
    #         output_container.mux(packet)
        
    #     sio.emit("getAudio", out.getvalue())
    #     # output_container.close()

    # output_container.close()
    
    # This is the runner up for most likely to work.
#     p = pyaudio.PyAudio()
#     stream = p.open(format=,
#                          channels=1,
#                          rate=44100,
#                          output=True,
#                          )
# Assuming you have a numpy array called samples
# data = samples.astype(np.float32).tostring()
# stream.write(data)
    # container = av.open(stream_path)
    # input_stream = container.streams.get(audio=0)[0]
    # pygame.mixer.pre_init(44100, size=-16, channels=1)
    # pygame.mixer.init()
    # print("ghe")
    # for frame in container.decode(input_stream):

    #     frame.pts = None
    #     # print(frame.to_ndarray())
    #     print("beg")
    #     print(frame.to_ndarray())# <-- this needs to be sent to the jsserver->client to play the audio in the browser
    #     print("end")
        # sio.emit('getAudio', base64.b64encode(frame.to_ndarray()))
        # print("made it")
        # sound.play()
        # sleep(0.01)

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


@sio.on("hey")
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
    

# if __name__=="__main__":
    
#     print("succcess")
#     sio.wait()

# def encode_audio(audio):
#     audio_content = audio.read()
#     return base64.b64decode(audio_content)

def decode_audio(in_filename):
    try:
        out = (ffmpeg
            .input(in_filename)
            .output('pipe', format='s16le', acodec='pcm_s16le', ac=1, ar='16k')
            .run_async(pipe_stdout=True)
        )
    except ffmpeg.Error as e:
        print(e.stderr, file=sys.stderr)
        sys.exit(1)
    return out