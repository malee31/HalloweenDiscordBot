const fs = require('fs');
const data = require("../private/badSaveData.json");
const config = require("./config.json");
const template = config.dbSchema;

for(let key in data.users) {
	if(data.users.hasOwnProperty(key)) {
		data.users[key] = Object.assign({}, template, data.users[key]);
	}
}

module.exports = {
	get: get,
	save: save,
	saveInterval: setInterval(save, 5000)
}

function save() {
	let saveThis = JSON.stringify(data);
	fs.writeFile(`${__dirname}/../private/badSaveData.json`, saveThis, (err) => {
		if(err) {
			console.log(`ERROR! ${err}`);
			console.log(`Data Dump: ${JSON.stringify(data)}`);
		}
		//console.log('Data written to file');
	});
}

function get(userID) {
	if(typeof userID !== "string" && typeof userID !== "number" && typeof userID !== "undefined") {
		console.log("UserID isn't a string or number... HOW?");
		return;
	}
	if(typeof data.users[userID] == "object") {
		console.log("They exist. Sending saved data");
		return data.users[userID];
	} else if(typeof userID == "undefined") {
		console.log("No user specified. Sending all user data");
		return data.users;
	} else {
		console.log("Making new user");
		data.users[userID] = Object.assign({userID: userID}, data.template);
		console.log("Altered: " + JSON.stringify(data));
		return data.users[userID];
	}
}
