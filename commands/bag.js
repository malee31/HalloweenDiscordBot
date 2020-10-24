const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'bag',
	description: 'Check how many candies you have',
	execute(message) {
		return message.channel.send(`You have ${badDatabase.get(message.author.id).balance} candies in your Trick o' Treat bag`);
	},
};
