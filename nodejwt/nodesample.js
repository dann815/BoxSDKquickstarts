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

var enterpriseID = "";
var sdk = new BoxSDK({
	clientID: "",
	clientSecret: "",
	appAuth: {
		keyID: "",
		privateKey: fs.readFileSync("./private_key.pem"),
		passphrase: ""
	}
});

sdk.getEnterpriseAppAuthTokens(enterpriseID, function(err, enterpriseToken) {
	if (err) { console.log("Problem Getting Enterprise App Auth Tokens:\n" + err); return; }
	console.log("Generated new Enterprise Token:");
	console.log("Enterprise App Admin Token: " + enterpriseToken);
});			

var client = sdk.getAppAuthClient('enterprise', enterpriseID);
client.users.get("me", null, function(err, currentUser) {
	if (err) { console.log("Problem getting current user object:\n" + err); return; }
	console.log("==== Current user: \n" + util.inspect(currentUser));
});