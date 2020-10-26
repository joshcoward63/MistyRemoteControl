from flask import Flask, render_template,request, redirect
import socketio
from playsound import playsound

app = Flask(__name__)
sio = socketio.Client()
sio.connect('http://192.168.0.5:5000')

@app.route("/")
def home():

    return render_template("index.html")

@app.route('/foo', methods=['POST'])
def foo(): 
    # playsound("C:\\Users\\Josh\\Downloads\\sample1.mp3")
    sio.emit("requestAudio")
    return 

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
def disconnect():
    print("I'm disconnected!")

if __name__ == '__main__':
   app.run(host="127.0.0.1", port=8080)



