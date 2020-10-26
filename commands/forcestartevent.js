const {forceStartEvent} = require("../parts/randomEvent.js");

module.exports = {
	name: 'forcestartevent',
	aliases: ['fse'],
	description: 'Force start a random event. Requires permission ADMINISTRATOR',
	execute(message, args) {
		console.log(`Event request by: ${message.author.username}#${message.author.discriminator}`);
		if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== process.env.owner) {
			return message.reply(`You have no authority here. Kneel.`);
		}
		console.log(`Force starting event by: ${message.author.username}#${message.author.discriminator}`);
		if(args[0]) {
			console.log(args[0]);
			forceStartEvent(message, args[0]);
			return;
		}
		forceStartEvent(message);
	},
};
