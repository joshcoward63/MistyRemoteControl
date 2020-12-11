# In order to run the program the following dependencies are required:

## WebServer

### Prior to running the node server perform the following commands 
1. Open a terminal inside of the folder webServer
2. check if node is installed by entering the following: 
	```node -v```
	
	
3. check if npm is installed by entering the following:
	```npm -v```
	
	
4. If both are installed enter the folowing:
    ```npm install express socket.io```
	
### To run the Webserver enter the following from a terminal within the webServer directory
```node  server.js```
	
## JavaScript Client
### Prior to running the JavaScript Client and the Python co-client to access Misty's remote control perform the following commands:
1. Open a terminal inside of the folder JSclient
2. Enter the following command:
	```npm install socket.io-client react-scripts```
	
3. For the python-co-client enter the following command:
	```pip install python-socketio==4.4.0 pyaudio```
	
### To run the browser application enter the following commands in a terminal from within the JSclient directory
1. Start the web browser
```npm start```

Note for Linux users: the lines

```
const config = require(".\\config.json");
var serverIp = config["server_ip"] + ":" + config["server_port"];
```
might not work, so you may need to hard-code `var serverIp = "ip-address:port";`

2. Start the python-co-client
```python audioStream.py```

## Python Client (Misty connector)
### Prior to running the Python Client that interfaces with Misty enter the following commands:
1. Open a terminal
2. Enter the following commands:
	```pip install python-socketio==4.4.0 requests base64 av threading Pillow numpy```
3. If you plan to use multiple robots make sure to change the robot name in the config file, ```config.json``` located in the src folder in the JSclient directory in order to differentiate between robots.
### Config File
#### The config file contains the following information:
1. Server IP address - address of the machine that the node server is hosted on
2. Server port - port of the machine that the node server will be listening on
3. Robot name - should be a unique named used to differentiate between connected robots.
4. Robot IP address - address of the Misty robot, this can be found through downloading the Misty App and connecting your Misty to it using Bluetooth	

### To run the client that interfaces with Misty enter the following command from within the PyClient directory
```python client.py```

## Troubleshooting:

### Potential Gotcha: 
If running program off of Boise State's VPN,
- The server IP address in the config file will need to be changed to match the IP address of the machine in which you plan to run the node server on.

### Potential Gotcha:
Misty's IP address is subject to change from network to network due to other Local Devices. 
- If at first there's no response double check Misty's IP address through the Misty app and make sure that it matches the IP address in the config file

## Known Bugs
- Currently the config file setup is not supported on linux and will throw an error when running the JSclient browser from it. 

	
