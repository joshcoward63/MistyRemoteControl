import eventlet
import socketio
import pyaudio
import threading
import time
import numpy as np
from BlockingQueue import BlockingQueue
queue = BlockingQueue(1000)

sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

# def add_silence():
#     global queue
#     noise = np.random.normal(0,0,100)
#     while True:
#         if queue.isEmpty():
#             queue.enqueue(noise)

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
            time.sleep(0.1)
            p = pyaudio.PyAudio()
            stream = p.open(format=pyaudio.paFloat32,
                    channels=1,
                    rate=44100,
                    output=True)
            
        # if queue.isEmpty() and item is None:
        #     stream.write(noise)
        #     print("playing whitenoise")

        # else:
        #     try:
                
        #         print("playing audio")
        #     except:
        #         print("error")
                
        #         # stream.write(item)
        #         print("playing audio")
                

@sio.event
def connect(sid, environ):
    print('connect ', sid)

@sio.on('audio')
def my_message(sid, data):
    global queue
    # print('receiving')
    queue.enqueue(data)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    t = threading.Thread(target=consumer_thread)
    t.start()  
    # t = threading.Thread(target=add_silence)
    # t.start()      
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
    
 