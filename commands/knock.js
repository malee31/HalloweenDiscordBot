const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'knock',
	aliases: ["visit"],
	description: 'Visit a friends house for candy. Results in them giving you some of their candy',
	cooldown: 3600,
	execute(message, args) {
		let rand = Math.random();

		if(!/^<@!?\d+>$/.test(args[0])) return message.channel.send(`Hmm, the bot can't find ${args[0]}'s address...`);
		if(rand < 0.20) return message.channel.send(`You got lost on your way to ${args[0]}'s house...`);

		let userToTrick = badDatabase.get(args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0]);
		let exchange = 0;
		let knockMsg = "";
		if(rand < 0.65) {
			if(userToTrick.balance > 1000) {
				exchange = 5;
				knockMsg = `You knocked on ${args[0]}'s door and their mom made them give you 5 pieces of candy`;
			} else if(userToTrick.balance > 300) {
				exchange = 2;
				knockMsg = `You knocked on ${args[0]}'s door and their mom made them give you 2 pieces of candy`;
	    	}
		} else {
			if(userToTrick.balance > 2000) {
				exchange = 45;
				knockMsg = `You knocked on ${args[0]}'s door but they weren't home so you stole their ENTIRE candy bucket. +45 candies`;
			} else if(userToTrick.balance > 1500) {
				exchange = 32;
				knockMsg = `You knocked on ${args[0]}'s door but they weren't home so you stole their ENTIRE candy bucket. +32 candies`;
	    	} else if(userToTrick.balance > 1000) {
				exchange = 21;
				knockMsg = `You knocked on ${args[0]}'s door but they weren't home so you stole their ENTIRE candy bucket. +21 candies`;
			} else if(userToTrick.balance > 700) {
				exchange = 15;
				knockMsg = `You knocked on ${args[0]}'s door but they weren't home so you grabbed 15 pieces of candied in their take one candy bucket!`;
			} else {
				exchange = 7;
				knockMsg = `You knocked on ${args[0]}'s door but they weren't home so you grabbed 7 pieces of candy from their Take One candy bucket!`;
			}
		}

		badDatabase.get(message.author.id).balance += exchange;
		userToTrick.balance -= exchange;
		message.channel.send(knockMsg);
	},
};
