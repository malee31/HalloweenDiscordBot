const {forceStartEvent} = require("../parts/randomEvent.js");

module.exports = {
	name: 'forcestartevent',
	aliases: ['fse'],
	description: 'Force start a random event. Requires permission ADMINISTRATOR',
	execute(message, args) {
		if(!message.member.hasPermission("ADMINISTRATOR")) return;
		if(args[0]) {
			console.log(args[0]);
			forceStartEvent(message, args[0]);
		}
		forceStartEvent(message);
	},
};
