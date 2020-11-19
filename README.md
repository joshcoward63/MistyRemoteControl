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
```npm start```
	
## JavaScript Brower
### Prior to running the JavaScript browser and the Python co-client to access Misty's remote control perform the following commands:
1. Open a terminal inside of the folder JSclient
2. Enter the following command:
	```npm install socket.io-client react-scripts```
	
3. For the python-co-client enter the following command:
	```pip install python-socketio==4.4.0 threading pyaudio```
	
### To run the browser application enter the following commands in a terminal from within the JSclient directory
1. Start the web browser
```npm start```
2. Start the python-co-client
```python audioStream.py```

## Python Client
### Prior to running the Python Client that interfaces with Misty enter the following commands:
1. Open a terminal
2. Enter the following commands:
	```pip install python-socketio==4.4.0 requests base64 av threading Pillow numpy```
3. If you plan to use multiple robots make sure to change the robot name in the client.py file in order to differentiate between robots.
	
### To run the client that interfaces with Misty enter the following command from within the PyClient directory
```python client.py```

## When running this system make sure to run the clients and server in the following order
1. Run WebServer
2. Run both the JavaScript browser and the audioStream
3. Finally run client.py to connect to Misty
4. From this point you should be able to select any of the connected Misty's from the dropdown menu in the browser

## Possible Issues and their solutions:

### If running program off of Boise State's VPN.
The IP addresses in the files client.py and index.js will need to be changed to match the IP address of the machine in which you plan to run the node server on.

### Misty's IP address is subject to change from network to network due to other Local Devices. 
If at first there's no response double check Misty's IP address through the Misty app and make sure that it matches the IP address in client.py

	
	
