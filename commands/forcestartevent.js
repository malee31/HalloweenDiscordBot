const {forceStartEvent} = require("../parts/randomEvent.js");

module.exports = {
	name: 'forcestartevent',
	aliases: ['fse'],
	description: 'Force start a random event. Requires permission ADMINISTRATOR',
	validate(message) {
		console.log(`Event requested by: ${message.author.username}#${message.author.discriminator}`);
		if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== process.env.owner) {
			message.reply("You have no authority here. Kneel.");
			return false;
		}
		return true;
	},
	execute(message, args) {
		console.log(`Force starting event by: ${message.author.username}#${message.author.discriminator}`);
		if(args[0]) {
			console.log(`Force started event: ${args[0]}`);
			forceStartEvent(message, args[0]);
			return;
		}
		forceStartEvent(message);
	},
};