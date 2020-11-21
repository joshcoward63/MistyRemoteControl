"""This script is soley responsible for playing audio on Frontend"""
import socketio
from BlockingQueue import BlockingQueue
import threading
import time
import pyaudio
import json

#Loads config file
with open("./../JSclient/src/config.json", 'r') as file:
    config = json.load(file)
server_ip = "http://" + config["server_ip"] + ":" + config["server_port"]

queue = BlockingQueue(1000)
sio = socketio.Client()

"""Connects to Server"""
print("connecting to", server_ip)
sio.connect(server_ip)

"""Plays audio stream"""
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

"""When the socket connects"""    
@sio.event
def connect():
    print("I'm connected!")

"""When the socket has an error"""
@sio.event
def connect_error():
    print("The connection failed!")

"""When the socket disconnects"""
@sio.event
def disconnect():
    print("I'm disconnected!")

"""Gets Audio from Misty"""
@sio.on("getAudio")
def getAudio(data):
    global queue
    # print('receiving')
    queue.enqueue(data)

if __name__ == '__main__':
    t = threading.Thread(target=consumer_thread)
    t.start()  