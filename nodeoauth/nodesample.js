/*

npm install --save box-node-sdk

Navigate to:
https://account.box.com/api/oauth2/authorize?response_type=code&client_id=3ul1x2hceokh64tegy65xjvcap09rbvh

Authorize the app.  Grab the oauth code from the URL.

Replace the oAuthCode string on line 30 below.  This creates a boxcreds.txt file with your tokens.
To run again from scratch delete that file and replace the OAuth code again.

node nodesample.js

*/

var BoxSDK = require('box-node-sdk');
const util = require('util'); // For inspecting SDK objects - util.inspect(OBJECT)
var fs = require('fs');

var TokenStore = require('./TokenStoreImpl.js');

var sdk = new BoxSDK({
	clientID: "",
	clientSecret: ""
});

var boxcredsfilepath = "boxcreds.txt";

var oAuthCode = ""; // 30 seconds from code generation to run program.  Ignored if boxcreds file exists

var client;

// Token file usage and initialization of client object
if (fs.existsSync(boxcredsfilepath)) {
	try {
		var tokenStore = new TokenStore(boxcredsfilepath);
		tokenStore.read(function(err, tokenInfo) {
			if (err) { console.log(err + "\n Problem reading token store"); return; }
			console.log("==== Access Token: " + tokenInfo.accessToken);
			client = sdk.getPersistentClient(tokenInfo, tokenStore);
			executeClientActions();
		});
	} catch (err) { console.log(err + "\n Problem creating persistent client."); return; }
} else {
	if(!oAuthCode) { console.log("No auth code or tokens file.  Modify the code with a oAuth Code or copy a Token Enpoint response into a .txt file called " + boxcredsfilepath); process.exit(); }
	sdk.getTokensAuthorizationCodeGrant(oAuthCode, null, function(err, tokenInfo) {
		if (err) { console.log(err + "\n Error in OAuth Code grant"); return; }
		var tokenStore = new TokenStore(boxcredsfilepath);
		tokenStore.write(tokenInfo, function(err) {
			if (err) { console.log(err + "\n Problem storing token to token store"); return; }
			try {
				client = sdk.getPersistentClient(tokenInfo, tokenStore);
				executeClientActions();
			} catch (err) { console.log(err + "\nExpired Auth: Auth code or refresh token has expired."); return; }
		});
	});
}

function executeClientActions() {
	// Current User
	client.users.get(sdk.CURRENT_USER_ID, null, function(err, currentUser) {
		console.log("==== Current user: " + util.inspect(currentUser));
	});

	// Users list
	client.users.get("", null, function(err, userList) {
		console.log("==== Users list: " + util.inspect(userList));
	});
}
