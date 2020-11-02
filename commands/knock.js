const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'knock',
	aliases: ["visit"],
	description: 'Visit a friends house for candy. Results in them giving you some of their candy',
	cooldown: 120,
	usage: "[@Username]",
	randomEvent: true,
	validate(message, args) {
		if(!/^<@!?\d+>$/.test(args[0])) {
			message.channel.send(`Hmm, the bot can't find ${args[0]}'s address...`);
			return false;
		}
		return true;
	},
	execute(message, args) {
		if(message.author.id === args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0]) {
			let user = badDatabase.get(message.author.id);
			user.balance -= Math.min(15, user.balance);
			return message.channel.send(`You knocked on your own door, annoying your mom who came to open it.\nYou slept in the yard that night, eating ${Math.min(15, user.balance)} candies from your bag in place of dinner`);
		}

		let rand = Math.random();

		if(rand < 0.20) return message.channel.send(`You got lost on your way to ${args[0]}'s house...`);

		let userToTrick = badDatabase.get(args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0]);
		let exchange = 0;
		let knockMsg = "";
		if(rand < 0.65) {
			if(userToTrick.balance > 1000) {
				exchange = 10;
			} else if(userToTrick.balance > 300) {
				exchange = 5;
			} else {
				exchange = 2;
			}
			knockMsg = `You knocked on ${args[0]}'s door and their mom made them give you ${exchange} pieces of candy`;
		} else {
			if(userToTrick.balance > 1000) {
				if(userToTrick.balance > 2000) {
					exchange = 45;
				} else if(userToTrick.balance > 1500) {
					exchange = 32;
				} else {
					exchange = 21;
				}
				knockMsg = `You knocked on ${args[0]}'s door but they weren't home so you stole their ENTIRE candy bucket. +${exchange} candies`;
			} else {
				exchange = userToTrick.balance > 700 ? 15 : 7;
				knockMsg = `You knocked on ${args[0]}'s door but they weren't home so you grabbed ${exchange} pieces of candy from their Take One bucket!`;
			}
		}

		badDatabase.get(message.author.id).balance += exchange;
		userToTrick.balance -= exchange;
		message.channel.send(knockMsg);
	},
};