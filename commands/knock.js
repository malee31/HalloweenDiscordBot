const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'knock',
	description: 'Visit a friends house for candy',
	cooldown: 5,
	execute(message, args) {
		let rand = Math.random();

		if(!/^<@!\d+>$/.test(args[0])) return message.channel.send(`Hmm, the bot can't find ${args[0]}'s address...`);
		if(rand < 0.20) return message.channel.send(`You got lost on your way to ${args[0]}'s house...`);

		let userToTrick = badDatabase.get(args[0].match(/(?<=^<@!)\d+(?=>$)/)[0]);
		let sender = badDatabase.get(message.author.id);
		if(rand < 0.8) {
			sender.balance += 2;
			userToTrick.balance -= 2;
			return message.channel.send(`You knocked on ${args[0]}'s door and they opened the door and gave you two piece of candy`);
		} else {
			sender.balance += 7;
			userToTrick.balance -= 7;
			return message.channel.send(`You knocked on ${args[0]}'s door but they weren't home. However there was candy outside it said to take ONE but you took 7 pieces. Don't be so greedy there won't be candy left for anyone else!`);
		}
	},
};
