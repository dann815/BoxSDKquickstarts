# Python SDK
# https://github.com/box/box-python-sdk

# Python scripting is usually done within a Virtual Environment
# sudo pip install virtualenv

# This line creates the environment, starts it, then installs the packages needed
# virtualenv pythonruntime && source pythonruntime/bin/activate && pip install -U setuptools wheel && pip install -U pip && pip install -U boxsdk

# To run the program
# python Sample.py

import os
from ConfigParser import SafeConfigParser
from boxsdk import OAuth2, Client
from boxsdk.network.logging_network import LoggingNetwork

# Hardcoded here from your Box Developer application
CLIENT_ID = ""
CLIENT_SECRET = ""

# Note on Generating First Tokens:  https://cloud.box.com/s/ni74f5y4kida1r6h6pv2f83z0ubz0h2a
ACCESS_TOKEN = "";
REFRESH_TOKEN = "";

# Flat file to save the API values to.
configfile_name = "config.yaml"


# Define the callback for the api object's Refresh Tokens method
def APIRefreshListener(access_t, refresh_t):
	print "*** REFRESHED TOKENS ***"
	config = SafeConfigParser()
	config.read(configfile_name)
	config.set('boxCredentials', 'accessToken', access_t)
	config.set('boxCredentials', 'refreshToken', refresh_t)
	with open(configfile_name, 'w') as f:
		config.write(f)
	return


def initializeAPIConnection():
	# If there is no configuration file with the previous token info, get the initial values and save them to file
	if not os.path.isfile(configfile_name):
		config = SafeConfigParser()
		if ACCESS_TOKEN is "":
			print "Initial Tokens not configured"
		config.add_section('boxCredentials')
		config.set('boxCredentials', 'clientID', CLIENT_ID)
		config.set('boxCredentials', 'clientSecret', CLIENT_SECRET)
		config.set('boxCredentials', 'accessToken', ACCESS_TOKEN)
		config.set('boxCredentials', 'refreshToken', REFRESH_TOKEN)
		with open(configfile_name, 'w') as f:
			config.write(f)
	# If the configuration file already exists, load the values
	else:
		config = SafeConfigParser()
		config.read(configfile_name)
		CLIENT_ID = config.get('boxCredentials', 'clientID')
		CLIENT_SECRET = config.get('boxCredentials', 'clientSecret')
		ACCESS_TOKEN = config.get('boxCredentials', 'accessToken')
		REFRESH_TOKEN = config.get('boxCredentials', 'refreshToken')
	return OAuth2(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, access_token=ACCESS_TOKEN, refresh_token=REFRESH_TOKEN, store_tokens=APIRefreshListener)


# MAIN
api = initializeAPIConnection()
# Use the network_layer to print out the specific API Requests and Responses
client = Client(api, network_layer=LoggingNetwork())

# Use the SDK object and parse the results
rootFolder = client.folder('0').get_items(1000)
for f in rootFolder:
	print f.id + "  " + f.name

# Make a direct call against the API and parse the results
apiResponse = client.make_request('GET', "https://api.box.com/2.0/users/me?fields=id,name,login,role").json()
print "Logged-in user " + apiResponse['login'] + " is the role: " + apiResponse['role']




