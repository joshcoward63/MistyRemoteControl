# In order to run the program the following dependencies are required:

## WebServer

### Prior to running the node server perform the following commands 
1. Open a ternminal inside of the folder webServer
2. check if node is installed by entering the following: 

	```
	node -v
	```
	
	
3. check if npm is installled by entering the following:
	
	```
	npm -v
	```
	
	
4. If both are installed enter the folowing:
    ```
	npm install express socket.io atob
	```
	
## JavaScript Brower
### Prior to running the JavaScript browser to access Misty's remote control perform the following commands:
1. Open a ternminal inside of the folder JSclient
2. Enter the following command:

	```
	npm install socket.io-client react-scripts
	```
	
	
## Python Client
### Prior to running the Python Client that interfaces with Misty enter the following commands:
1. Open a terminal
2. Enter the following commands:
    
	```
	pip install python-socketio==4.4.0 requests base64
	```
	
### If running program off of Boise State's VPN the IP addresses in the files client.py and index.js will need to be changed to match the
IP address of the machine in which you plan to run the node server on.

### Misty's IP address is subject to change from network to network due to other Local Devices. 
If at first there's no response double check Misty's IP address through the Misty app and make sure that it matches the IP address in client.py

	
	
