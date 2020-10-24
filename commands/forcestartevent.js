const {forceStartEvent} = require("../parts/randomEvent.js");

module.exports = {
	name: 'forcestartevent',
	description: 'Force start a random event',
	execute(message) {
		//if(!message.member.hasPermission("ADMINISTRATOR")) return;
		forceStartEvent(message.channel);
	},
};
