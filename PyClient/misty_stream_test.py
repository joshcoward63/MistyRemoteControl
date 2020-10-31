
from MistyAPI import Robot
import pyaudio
import av
import numpy as np

robot_ip = '192.168.1.137'
robot = Robot(robot_ip)

# robot.enable_avstream()
# robot.stream_av()

stream_path = 'rtsp://{}:1936'.format(robot_ip)
next_container = av.open(stream_path)

p = pyaudio.PyAudio()

stream = p.open(format=pyaudio.paFloat32,
                channels=1,
                rate=44100,
                output=True)

# The following can save audio to a playable file
input_stream = next_container.streams.get(audio=0)[0]
output_container = av.open("live_stream_new.mp3", 'w')
output_stream = output_container.add_stream('mp3')
for frame in next_container.decode(input_stream):
    frame.pts = None
    stream.write(frame.to_ndarray().astype(np.float32).tostring())
    for packet in output_stream.encode(frame):
        output_container.mux(packet)
        # stream.write(packet)
    # for packet in output_stream.encode(None):
    #     output_container.mux(packet)
output_container.close()