const {currentEvents} = require("../parts/randomEvent.js");

module.exports = {
	name: 'currentevents',
	description: 'Get a list of all the events going on',
	execute(message) {
		if(!message.member.hasPermission("ADMINISTRATOR")) return;
		message.author.send(JSON.stringify(currentEvents()));
	},
};
