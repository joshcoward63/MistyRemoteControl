from flask import Flask, render_template,request, redirect
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


queue = BlockingQueue(5)
app = Flask(__name__)
sio = socketio.Client()
sio.connect('http://192.168.0.8:5000')
p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paFloat32,
                channels=1,
                rate=44100,
                output=True)
audioQueue = []
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
    global stream
    # print(data)
    consumerThread1 = Thread(target=consumer_thread, name="consumer-1", args=(queue,), daemon=True)
    producerThread1 = Thread(target=producer_thread, name="producer-1", args=(queue, data), daemon=True)
    consumerThread1.start()
    producerThread1.start()
    # time.sleep(.001)
    # stream.write(queue.dequeue())

    # print("playing  audio")
    # stream.write(data)

# @sio.on("getVideo")
# def getVideo(videoData): 
#     print("Recieving video")
    
def consumer_thread(q):
    global stream
    noise = np.random.normal(0,1,100)
    item = q.dequeue()

    if queue.isEmpty() and item is None:
        stream.write(noise)
        print("playing whitenoise")

    else:
        try:
            stream.write(item)
            print("playing audio")
        except:
            print("error")
            p = pyaudio.PyAudio()
            stream = p.open(format=pyaudio.paFloat32,
                    channels=1,
                    rate=44100,
                    output=True)
            stream.write(item)
            print("playing audio")

def producer_thread(q, val):
    item = val        
    q.enqueue(item)


if __name__ == '__main__':
   app.run(host="127.0.0.1", port=8080)



