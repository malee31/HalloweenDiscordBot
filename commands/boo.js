const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'boo',
	aliases: ['scare', 'shock', 'spook'],
	description: 'Scare the neighborhood Trick o\' Treaters and take their candy',
	cooldown: 15,
	randomEvent: true,
	cooldownMessage(message, cooldown) {
		return message.channel.send(`All the kids have already been scared off. Now to wait...\nCooldown: ${cooldown}`);
	},
	execute(message) {
		if(Math.random() < 0.6) {
			badDatabase.get(message.author.id).balance += 10;
			return message.channel.send("You scared the poor kid and they dropped 10 candies you ugly bastard!");
		} else {
			badDatabase.get(message.author.id).balance -= 3;
			return message.channel.send("You tried to scare the kid but they jumped you and stole your candy! -3 candies");
		}
	},
};