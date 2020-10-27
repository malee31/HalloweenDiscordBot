const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'rob',
	aliases: ["steal", "heist", "snatch"],
	description: 'The ultimate betrayal. Take all the good candy from your friend without getting caught!\n`WARNING: You can lose up to how much you try to steal\nFines calculated with (Amount you failed to steal) * ((Your balance) / ((Target\'s balance) * 2)) and caps at the amount you tried to steal.`',
	usage: '[@Username] [amount]',
	cooldown: 900,
	validate(message, args) {
		if(!/^<@!?\d+>$/.test(args[0])) {
			message.channel.send(`Hmm, the bot can't find your target, ${args[0]}...`);
			return false;
		}

		let dbStealFrom = badDatabase.get(args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0]);
		let dbThief = badDatabase.get(message.author.id);

		let stealAmount = Number.parseInt(args[1]);
		if(isNaN(stealAmount)) {
			message.channel.send("That's not a valid number of candies steal from friend!");
			return false;
		}
		stealAmount = Math.floor(stealAmount);

		if(stealAmount <= 0) {
			message.channel.send("You're trying to gain candy, not lose it!");
			return false;
		}
		if(dbThief.balance < stealAmount) {
			message.channel.send("You can't steal more than what you have");
			return false;
		}
		if(dbStealFrom.balance < stealAmount){
			message.channel.send("They don't have that much to steal");
			return false;
		}
		// if(dbThief.balance > 2 * dbStealFrom.balance) {
		// 	message.channel.send("You'll lose more than you'll gain if you're caught.\nIt's not worth it");
		// 	return false;
		// }
		args[1] = stealAmount;
		return true;
	},
	execute(message, args) {
		let dbStealFrom = badDatabase.get(args[0].match(/(?<=^<@!?)\d+(?=>$)/)[0]);
		let dbThief = badDatabase.get(message.author.id);

		let stealAmount = args[1];

		let chance = Math.floor(Math.random() * 101 + 1);

		if(chance >= 30 && chance <= 60) {
			let loss = Math.floor((chance - 30) / 100 * stealAmount);
			dbStealFrom.balance -= stealAmount;
			dbThief.balance += stealAmount - loss;
			return message.channel.send(`${message.author.toString()} stole ${stealAmount} from ${args[0]} and lost ${loss} while running away`);
		} else {
			let fineRate = Math.min(dbThief.balance / (2 * dbStealFrom.balance), 1);
			let fine = Math.floor(fineRate * stealAmount);

			dbThief.balance -= fine;

			return message.channel.send(`${message.author.toString()} was fined ${fine} candies (${(fineRate * 100).toFixed(1)}% of what they tried to steal) after being caught stealing from ${args[0]}`);
		}
	},
};
