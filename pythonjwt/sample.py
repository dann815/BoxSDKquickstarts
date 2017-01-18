

import os, sys, time, io, json, logging, csv, datetime
from ConfigParser import SafeConfigParser
from boxsdk import OAuth2, JWTAuth, Client
from boxsdk.exception import BoxAPIException
from boxsdk.network.logging_network import LoggingNetwork

client_id = ""
client_secret = ""
enterprise_id = ""
jwt_key_id = ""
rsakey_filename = ""
rsakey_passphrase = None

logger = LoggingNetwork()

start_time = time.time()

auth = JWTAuth(
	client_id=client_id, 
	client_secret=client_secret, 
	enterprise_id=enterprise_id,
	jwt_key_id=jwt_key_id,
	rsa_private_key_file_sys_path=rsakey_filename,
	rsa_private_key_passphrase=rsakey_passphrase,
	network_layer=logger,
)
print "App Admin Token: " + str(auth.access_token)
client = Client(auth)

print '-'*80
me = client.user(user_id='me').get()
print 'Logged in as: '
print 'NAME: '+ me['name']
print 'EMAIL: ' + me['login']
print 'ID: ' + me.id
role = me.get(fields=['role']).role
print "User's Role is " + role

print '-'*80
print "Users:"
users = client.users()
print users
print '-'*80
appusers = [u for u in users if u.login[:7]=="AppUser"]

if len(appusers) == 0:
	print "There are no app users in this account"
	exit(0)
else:
	print "AppUsers:"
	print appusers
print '-'*80


user_auth = JWTAuth(
	client_id=client_id, 
	client_secret=client_secret, 
	enterprise_id=enterprise_id,
	jwt_key_id=jwt_key_id,
	rsa_private_key_file_sys_path=rsakey_filename,
	rsa_private_key_passphrase=rsakey_passphrase,
	network_layer=logger,
)

print '-'*80
for u in appusers:
	user = client.user(user_id=u.id).get()

	print "AUTHENTICATING USER: " + user['id'] + " (" + user['name']+ ")"
	user_auth.authenticate_app_user(user) # <--- Authenticate as the user
	print '-'*80

	user_client = Client(user_auth)
	print user_auth.access_token
print '-'*80

print '-'*80
print 'SCRIPT EXECUTION COMPLETE' 
print "--- Completed execution in %s seconds ---" % (time.time() - start_time)
print '-'*80
