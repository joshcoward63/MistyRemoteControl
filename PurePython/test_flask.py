from flask import Flask 
from flask_socketio import SocketIO, send
import socketio

sio = socketio.Client()
sio.connect('http://192.168.0.8:5500')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins='*')

@socketio.on('message')
def handleMessage(msg):
	print('Message: ' + msg)
	send(msg, broadcast=True)

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

@sio.on("getVideo")
def getVideo(videoData): 
    print("Recieving video")
    socketio.send(videoData,broadcast=True)


if __name__ == '__main__':
	socketio.run(app)