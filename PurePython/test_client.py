import socketio
import time
import threading

sio = socketio.Client()

from MistyAPI import Robot
import av
import numpy as np

robot_ip = '192.168.0.9'
robot = Robot(robot_ip)
# robot.enable_avstream()
# robot.stream_av()

next_container = None

def consumer_thread():
    global next_container
    print("connected, starting stream")
    stream_path = 'rtsp://{}:1936'.format(robot_ip)
    next_container = av.open(stream_path)
    input_stream = next_container.streams.get(audio=0)[0]
    for frame in next_container.decode(input_stream):
        frame.pts = None
        sio.emit('audio', frame.to_ndarray().astype(np.float32).tostring())

@sio.event
def connect():
    t = threading.Thread(target=consumer_thread)
    t.start()  


@sio.event
def my_message(data):
    print('message received with ', data)

@sio.event
def disconnect():
    print('disconnected from server')


sio.connect('http://192.168.0.8:5500')
sio.wait()