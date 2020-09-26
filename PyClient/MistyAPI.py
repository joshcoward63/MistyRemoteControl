import requests
import json
import threading
import time

class Robot:

    def __init__(self,ip):
        self.ip = ip

        self.images_saved = []
        self.audio_saved  = []
        self.faces_saved = []

        self.backpack_instance = None
        self.time_of_flight_instance = [None]*4
        self.face_recognition_instance = None
        self.trying_to_align = False
        self.available_subscriptions = ["SerialMessage", "TimeOfFlight","FaceRecognition","LocomotionCommand","HaltCommand","SelfState","WorldState"]
        # self.start_small_random_movements()
        #self.populateImages()
        #self.populateAudio()
        #self.populateLearnedFaces()

    def start_small_random_movements(self):

        def inner():
            while True:
                if self.trying_to_align:
                    time.sleep(3.0)
                    continue
                d = choice([30,40,-30,-40])
                t = choice([100,200,250])
                self.drive_time(d,d,t)
                w = choice([1,2,3,4])
                time.sleep(w)

        t = threading.Thread(target=inner)
        t.start()    

    def change_LED(self,red,green,blue):
        assert red in range(0,256) and blue in range(0,256) and green in range(0,256), " changeLED: The colors need to be in 0-255 range"
        requests.post('http://'+self.ip+'/api/led',json={"red": red,"green": green,"blue": blue})

    def change_image(self,image_name,timeout=5):
        if image_name in self.images_saved:
            requests.post('http://{}/api/images/display'.format(self.ip),json={'FileName': image_name ,'TimeOutSeconds': 5,'Alpha': 1})
        else:
            print(image_name,"not found on the robot, use <robot_name>.printImageList() to see the list of saved images")

    def play_audio(self,file_name):
        if file_name in self.audio_saved:
            requests.post('http://'+self.ip+'/api/audio/play',json={"AssetId": file_name})
        else:
            print(file_name,"not found on the robot, use <robot_name>.printAudioList() to see the list of saved audio files")

    def take_picture(self):
        resp = requests.get('http://{}/api/cameras/rgb?Base64=true'.format(self.ip))
        resp = resp.json()
        reply = resp['result']
        # print(reply)
        return reply

    def battery(self):
        resp = requests.get('http://{}/api/battery'.format(self.ip))
        resp = resp.json()
        return resp['result']

    def move_arm(self,arm,position,velocity=75):
        assert position in range(-91,91), " moveArm: position needs to be -90 to 90"
        assert velocity in range(0,101), " moveArm: Velocity needs to be in range 0 to 100"
        requests.post('http://'+self.ip+'/api/arms',json={"Arm": arm, "Position":position, "Velocity": velocity})

    def move_head(self,roll,pitch,yaw,velocity=75):
        assert -45 <= roll <= 45
        assert -45 <= pitch <= 45
        assert -70 <= yaw <= 70
        assert velocity in range(0,101), " moveHead: Velocity needs to be in range 0 to 100"
        requests.post('http://'+self.ip+'/api/head',json={"Pitch": int(pitch), "Roll": int(roll), "Yaw": int(yaw), "Velocity": velocity})

    def drive(self,linear_velocity, angular_velocity):
        assert linear_velocity in range(-100,101) and angular_velocity in range(-100,101), " drive: The velocities needs to be in the range -100 to 100"
        requests.post('http://'+self.ip+'/api/drive',json={"LinearVelocity": linear_velocity,"AngularVelocity": angular_velocity})

    def drive_time(self,linear_velocity, angular_velocity,time_in_milli_second):
        assert linear_velocity in range(-100,101) and angular_velocity in range(-100,101), " driveTime: The velocities needs to be in the range -100 to 100"
        assert isinstance(time_in_milli_second, int) or isinstance(time_in_milli_second, float), " driveTime: Time should be an integer or float and the unit is milli seconds"
        requests.post('http://'+self.ip+'/api/drive/time',json={"LinearVelocity": linear_velocity,"AngularVelocity": angular_velocity, "TimeMS": time_in_milli_second})

    def drive_track(self,left_track_speed,right_track_speed):
        assert left_track_speed in range(-100,101) and right_track_speed in range(-100,101), " driveTrack: The velocities needs to be in the range -100 to 100"
        requests.post('http://'+self.ip+'/api/drive/track',json={"LeftTrackSpeed": left_track_speed,"RightTrackSpeed": right_track_speed})
    
    def stop(self):
        requests.post('http://'+self.ip+'/api/drive/stop')

    def object_check(self, go_box):
        xmin = go_box['xmin'] #/ self.max_x # scale to 0-1
        xmax = go_box['xmax'] #/ self.max_x # scale to 0-1
        ymin = go_box['ymin'] #/ self.max_y # scale to 0-1
        ymax = go_box['ymax'] #/ self.max_y # scale to 0-1
        height = ymax - ymin
        width = xmax - xmin
        height = height 
        width = width 
        area = height * width    
        x_center = (width/2) + xmin
        y_center = (height/2) + ymin
        if area > 0.40 or ymin < 0.01 or ymax > 0.60: 
            # print('check FAILED', 'ymin: ', ymin, 'ymax: ', ymax, 'obj area: ', area)
            return (False, y_center, x_center)
        else: 
            # print('check PASSED', 'ymin: ', ymin, 'ymax: ', ymax, 'obj area: ', area)
            return (True, y_center, x_center)

    def find_coordinates(self, go_box):
        real_obj = self.object_check(go_box)    
        x_center = real_obj[2]
        y_center = real_obj[1]
        if not real_obj[0]: 
            turn_angle = 0
        else:
            if x_center > 0.56 or x_center < 0.44:
                x_diff = x_center - 0.5
                turn_angle = (x_diff * (-50)) / 2
            else: turn_angle = 0 
            if y_center > 0.48 or y_center < 0.36:
                y_diff = y_center - 0.42
                base = y_diff * (-10)
                
        return real_obj[0], turn_angle            
        
    def send_backpack(self,message):
        assert isinstance(message, str), " sendBackpack: Message sent to the Backpack should be a string"
        requests.post('http://'+self.ip+'/api/serial',json={"Message": message})

    def populate_images(self):
        self.images_saved = []
        resp = requests.get('http://{}/api/images/list'.format(self.ip))
        resp = resp.json()
        for reply in resp['result']:
            self.images_saved.append(reply["name"])

    def populate_audio(self):
        self.audio_saved = []
        resp = requests.get('http://{}/api/audio/list'.format(self.ip))
        resp = resp.json()
        for out in resp["result"]:
                self.audio_saved.append(out["name"])

    def populate_learned_faces(self):
        self.faces_saved = []
        resp = requests.get('http://{}/api/faces'.format(self.ip))
        resp = resp.json()
        self.faces_saved = resp["result"]

    def print_image_list(self):
        print(self.images_saved)
    
    def get_image_list(self):
        return self.images_saved

    def print_audio_list(self):
        print(self.audio_saved)
    
    def get_audio_list(self):
        return self.audio_saved
    
    def print_subscription_list(self):
        print(self.available_subscriptions)

    def start_face_recognition(self):
        requests.post('http://'+self.ip+'/api/faces/recognition/start')
    
    def stop_face_recognition(self):
        requests.post('http://'+self.ip+'/api/faces/recognition/stop')

    def print_learned_laces(self):
        print(self.faces_saved)

    def get_learned_faces(self):
        return self.faces_saved

    def clear_learned_faces(self):
        requests.delete('http://'+self.ip+'/api/faces')
        self.faces_saved = []
    
    def learn_face(self,name):
        assert isinstance(name, str), " trainFace: name must be a string"
        requests.post('http://'+self.ip+'/api/faces/training/start',json={"FaceId": name})
        print("Please look at Misty's face for 15 seconds..")
        for i in range(15):
            print(15-i)
            time.sleep(1)
        print("Face Captured!!")
        print("Please allow 15 second processing time !")
        for i in range(15):
            print(15-i)
            time.sleep(1)
        print("Face Trained")
        self.populateLearnedFaces()