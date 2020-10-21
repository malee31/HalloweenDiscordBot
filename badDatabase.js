const fs = require('fs');
const data = require("./private/badSaveData.json");

module.exports = {
	get: userID => {
		if(typeof userID !== "string" && typeof userID !== "number") {
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
	},
	save: save,
	saveInterval: setInterval(save, 5000)
}

function save() {
	let saveThis = JSON.stringify(data);
	console.log(saveThis);
	fs.writeFile("./private/badSaveData.json", saveThis, (err) => {
		if(err) {
			console.log(`ERROR! ${err}`);
			console.log(`Data Dump: ${JSON.stringify(data)}`);
		}
		console.log('Data written to file');
	});
}
