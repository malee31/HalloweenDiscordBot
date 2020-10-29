const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'set',
	description: 'Set your candies to a specific amount',
	usage: "[amount]",
	validate(message, args) {
		if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== process.env.owner) {
			message.reply("You have no authority here. Kneel.");
			return false;
		}
		if(isNaN(Number.parseInt(args[0]))) {
			return message.channel.send(`${args[0]} is not a valid amount of candies to have`);
		}

		args[0] = Number.parseInt(args[0]);
		return true;
	},
	execute(message, args) {
		badDatabase.get(message.author.id).balance = args[0];
		return message.channel.send(`${message.author.toString()} set their balance to ${badDatabase.get(message.author.id).balance}`);
	},
};
