/**
 * @fileoverview In-Memory Token Store
 * @module box-node-sdk/token-store
 */

'use strict';

var fs = require('fs');
var util = require('util');

var boxcredsfilepath = ""; // Set by constructor

var store = new Map(); // Not used.  Keeping for commented out example of callbacks.

/**
 * Basic in-memory Token Store, not suitable for use in production!
 * @param {string} userID The ID of the user whose tokens will be stored
 * @constructor
 */
// function TokenStore(userID) {

// 	this.userID = userID;
// }

function TokenStore(boxcreds) {
	boxcredsfilepath = boxcreds;
}


TokenStore.prototype = {

	/**
	 * Read the user's tokens from the store
	 * @param {Function} callback Passed the user's tokens
	 * @returns {void}
	 */

	read: function(callback) {

		var boxCredsString = fs.readFileSync(boxcredsfilepath);
		var boxCredsJSON = JSON.parse(boxCredsString);

		console.log("==== Read tokens from file: " + util.inspect(boxCredsJSON));

		callback(null, boxCredsJSON);
		//callback(null, store.get(this.userID));
	},

	/**
	 * Write the user's tokens to the store
	 * @param {Object} tokenInfo The user's token info
	 * @param {Function} callback The callback
	 * @returns {void}
	 */
	write: function(tokenInfo, callback) {
		console.log("==== Writing tokens to file: " + util.inspect(tokenInfo));
		fs.writeFileSync(boxcredsfilepath, 
			JSON.stringify( tokenInfo, null, 2), 
			'utf-8');
		
		//store.set(this.userID, tokenInfo);
		callback();
	},

	/**
	 * Clears the user's tokens from the store
	 * @param {Function} callback The callback
	 * @returns {void}
	 */
	clear: function(callback) {
		//store.delete(this.userID);
		callback();
	}
};

module.exports = TokenStore;