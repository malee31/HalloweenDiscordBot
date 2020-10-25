const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'knock',
	aliases: ["visit"],
	description: 'Visit a friends house for candy. Results in them giving you some of their candy',
	cooldown: 10,
	execute(message, args) {
		let rand = Math.random();

		if(!/^<@!?\d+>$/.test(args[0])) return message.channel.send(`Hmm, the bot can't find ${args[0]}'s address...`);
		if(rand < 0.20) return message.channel.send(`You got lost on your way to ${args[0]}'s house...`);

		let userToTrick = badDatabase.get(args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0]);
		let exchange = 0;
		let knockMsg = "";
		if(rand < 0.9) {
			exchange = 2;
			knockMsg = `You knocked on ${args[0]}'s door and their mom made them give you 2 pieces of candy`;
		} else {
			exchange = 6;
			knockMsg = `You knocked on ${args[0]}'s door but they weren't home.\nYou grabbed 6 pieces of candy from their Take One candy bucket!`;
		}

		badDatabase.get(message.author.id).balance += exchange;
		userToTrick.balance -= exchange;
		message.channel.send(knockMsg);
	},
};
