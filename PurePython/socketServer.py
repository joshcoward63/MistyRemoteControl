import eventlet
import socketio
sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})
@sio.event
def connect(sid, environ):
    print('connect ', sid)
@sio.event
def my_message(sid, data):
    print('message ', data)
    
@sio.event
def disconnect(sid):
    print('disconnect ', sid)

@sio.on("getAudio")
def getAudio(data):
    sio.emit("getAudio", data)


@sio.on("requestAudio")
def requestAudio(data):
    sio.emit("requestAudio")    
if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)