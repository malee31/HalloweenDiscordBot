const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'set',
	description: 'Set your candies to a specific amount',
	execute(message, args) {
		badDatabase.get(message.author.id).balance = Number.parseInt(args[0]);
		return message.channel.send(`${message.author.toString()} set their balance to ${badDatabase.get(message.author.id).balance}`);
	},
};
