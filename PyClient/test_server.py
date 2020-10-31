import eventlet
import socketio
import pyaudio

sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

p = pyaudio.PyAudio()

stream = p.open(format=pyaudio.paFloat32,
                channels=1,
                rate=44100,
                output=True)

@sio.event
def connect(sid, environ):
    print('connect ', sid)

@sio.on('audio')
def my_message(sid, data):
    global stream
    print('receiving')
    stream.write(data)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5150)), app)