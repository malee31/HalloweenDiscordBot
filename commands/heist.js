const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'heist',
	aliases: ["steal", "rob", "snatch"],
	description: 'The ultimate betrayal. Take all the good candy from your friend without getting caught!',
	usage: '<prefix>heist <@Username> <amount>',
	cooldown: 3600,
	execute(message, args) {
		if(!/^<@!?\d+>$/.test(args[0])) return message.channel.send(`Hmm, the bot can't find your target, ${args[0]}...`);

		/*Risk: Corresponding percentage of your money
		* Limit: Cooldown and no more than 150 more than yourself or 0
		* */
		const additionalCap = 150;

		let stealFrom = args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0];
		let theif = message.author.id;

		let dbStealFrom = badDatabase.get(stealFrom);
		let dbTheif = badDatabase.get(theif);

		let stealAmount = Number.parseInt(args[1]);
		if(isNaN(stealAmount)) return message.channel.send("That's not a valid number of candies to give your friend!");
		if(stealAmount < 0) return message.channel.send("You're trying to gain candy, not lose it!");
		if(dbTheif.balance + additionalCap > stealAmount && stealAmount > additionalCap) return message.channel.send(`If you steal more than ${additionalCap}, you need to have at least ${dbTheif.balance + additionalCap}`);
		stealAmount = Math.floor(stealAmount);

		let chance = Math.random();

		if(chance < 0.1) {
			let loss = Math.floor(chance * stealAmount);
			dbTheif.balance += stealAmount - loss;
			message.channel.send(`${message.author.toString()} stole ${stealAmount} from ${args[0]} and lost ${loss} while running away`);
		} else {
			dbTheif.balance = Math.floor(0.9 * dbTheif.balance);
			message.channel.send(`${message.author.toString()} was caught stealing from ${args[0]}. Their mom took away a tenth of their candy`);
		}
		if(badDatabase.get(message.author.id).balance < (exchange + loss)) return message.channel.send("HEY! You don't have enough candy to give away!");

		badDatabase.get(message.author.id).balance -= (exchange + loss);
		badDatabase.get(giveTo).balance += exchange;

		return message.channel.send(`${message.author.toString()} gave ${args[0]} ${exchange} candies after eating ${loss} of the ${args[1]} he took out of his bag!\nHow generous!`);
	},
};
