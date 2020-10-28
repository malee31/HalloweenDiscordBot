const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'pass',
	description: 'Your mom passes out candy to the Trick o\' Treaters',
	cooldown: 450,
	cooldownMessage(message, cooldown) {
		return message.channel.send(`If you take all the candy, your mom will get mad!\nCooldown: ${cooldown}`);
	},
	execute(message) {
		let leftovers = Math.floor(Math.random() * 21) + 15;
		badDatabase.get(message.author.id).balance += leftovers;
		message.channel.send(`Your mom gave out candy and had ${leftovers} candies left over for you\nHere, you can take it!`);
	},
};
