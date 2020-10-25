const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'share',
	aliases: ["give", "gift", "donate"],
	description: 'Give a friend some of your candy. A little bit is lost along the way (0-5%)',
	usage: '<prefix>share <@Username> <amount>',
	cooldown: 5,
	execute(message, args) {
		console.log(args[0]);
		if(!/^<@!?\d+>$/.test(args[0])) return message.channel.send(`Hmm, the bot can't find your friend, ${args[0]}...`);

		let loss = Math.random() * 0.05;

		let giveTo = args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0];
		let exchange = Number.parseInt(args[1]);
		if(isNaN(exchange)) return message.channel.send("That's not a valid number of candies to give your friend!");
		if(exchange < 0) return message.channel.send("Share, not steal.");

		loss = Math.floor(exchange * loss);
		exchange = Math.floor(exchange - loss);

		badDatabase.get(message.author.id).balance -= (exchange + loss);
		badDatabase.get(giveTo).balance += exchange;

		return message.channel.send(`${message.author.toString()} gave ${args[0]} ${exchange} candies and after eating ${loss} of the ${args[1]} he took out of his bag!\nHow generous!`);
	},
};
