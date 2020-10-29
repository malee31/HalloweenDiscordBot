const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'trickotreat',
	aliases: ["trickortreat", "tricktreat", "trick/treat", "tt"],
	description: 'Go Trick o\' Treating for candy',
	cooldown: 60,
	randomEvent: true,
	cooldownMessage(message, cooldown) {
		return message.channel.send(`"Walk to the next house! Stop running or we're never trick o' treating again!"\n-Your Mom\nCooldown: ${cooldown}`);
	},
	execute(message) {
		let senderData = badDatabase.get(message.author.id);
		let chance = Math.random();
		if(chance < 0.1) {
			senderData.balance += 20;
			message.channel.send("OHHH! This is a rich neighborhood! +20 candies");
		} else if(chance < 0.25) {
			senderData.balance -= 10;
			message.channel.send("You got beat up by the kid in a full Batman costume. Ugh, rich kids. -10 candies");
		} else if(chance < 0.40) {
			senderData.balance += 2;
			message.channel.send("\"Take One.\" Cheapskate. +2 candy");
		} else if(chance < 0.65) {
			senderData.balance += 8;
			message.channel.send("\"That's a nice costume you've got, dear. Here you go, Happy Halloween.\" +8 candies");
		} else if(chance < 0.85) {
			message.channel.send("Licorice and Bottle Caps don't qualify as candy. +0 candy");
		} else {
			message.channel.send("No one answered the door");
		}
	},
};
