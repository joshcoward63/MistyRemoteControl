from flask import Flask, render_template,request, redirect
from flask_socketio import SocketIO, send
import socketio
from playsound import playsound
import pyaudio
import base64
from io import BytesIO
import io
import av
import subprocess
import numpy as np
import sys
import time
from BlockingQueue import BlockingQueue
import threading
from threading import Thread
from threading import current_thread
import random
import os
import io
import PIL.Image as Image
from array import array
from flask_session import Session

queue = BlockingQueue(1000)
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketioServer = SocketIO(app, cors_allowed_origins='*')
sio = socketio.Client()
sio.connect('http://192.168.0.8:5500')

def consumer_thread():
    global queue

    p = pyaudio.PyAudio()

    stream = p.open(format=pyaudio.paFloat32,
                    channels=1,
                    rate=44100,
                    output=True)

    while True:
        item = queue.dequeue()
        try: 
            stream.write(item, exception_on_underflow=True)
        except:
            print("EXCEPTION!")
            time.sleep(0.001)
            p = pyaudio.PyAudio()
            stream = p.open(format=pyaudio.paFloat32,
                    channels=1,
                    rate=44100,
                    output=True)
            
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/requestAudio', methods=['POST'])
def requestAudio(): 
    sio.emit("requestAudio")    

@app.route('/requestVideo', methods=['POST'])
def requestVideo(): 
    sio.emit("requestVideo")


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

@sio.on("getAudio")
def getAudio(data):
    global queue
    print('receiving')
    queue.enqueue(data)
    # time.sleep(.001)
    # stream.write(queue.dequeue())

    # print("playing  audio")
    # stream.write(data)

# @sio.on("getVideo")
# def getVideo(videoData): 
#     print("Recieving video")
#     imag = Image.open(io.BytesIO(videoData))
#     imag.show()

@socketioServer.on('message')
def handleMessage(msg):
	print('Message: ' + msg)
	send(msg, broadcast=True)

if __name__ == '__main__':
    t = threading.Thread(target=consumer_thread)
    t.start()         
    app.run(host="127.0.0.1", port=8080)