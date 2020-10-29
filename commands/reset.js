const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'reset',
	aliases: ["restart", "delete"],
	description: 'Get rid of all your candy or all of your debt. Copy and paste usage exactly.\n`WARNING: Irreversible`',
	usage: "all of my candy to zero (0)",
	execute(message, args) {
		if(args.join(" ") !== "all of my candy to zero (0)") return message.channel.send("Type *<prefix> reset all of my candy to zero (0)* to reset your balance to 0. This is irreversible");

		console.log(`Reset balance of ${message.author.toString()} from ${badDatabase.get(message.author.id).balance} to 0`);
		badDatabase.get(message.author.id).balance = 0;
		return message.channel.send(`${message.author.toString()} tossed away all of their candies and reset themselves to having 0 candies`);
	},
};
