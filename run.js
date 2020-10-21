const Discord = require("discord.js");
const client = require("./parts/bot.js");
const config = require("./parts/config.json");
const cmdParse = require("./parts/commandParse.js");
const argFormat = require("./parts/format.js");
const badDatabase = require("./parts/badDatabase.js");

client.on('message', async msg => {
	if(msg.author.bot || !msg.content.startsWith(config.prefix)) return;

	let cmd = cmdParse(msg.content);
	let senderData = badDatabase.get(msg.author.id);

	switch(cmd.command) {

		case "allowance":
			let allowance = Math.floor(Math.random() * 1000);
			senderData.balance += allowance;
			msg.channel.send(`Your mom gave you an allowance\nYou bought ${allowance} candies with it`);
		break;

		case "greet":
			msg.author.send("Have a SPOOKY Halloween");
		break;

		case "profile":
			msg.channel.send(`You have ${senderData.balance} candies in your Trick O' Treat bag`);
		break;

		case "pulse":
			msg.channel.send("I'm still alive. \nBut you won't be for long.");
		break;

		case "trick":
			if(/^<@!\d+>$/.test(cmd.parsed[0])) {
				let userToTrick = cmd.parsed[0].match(/(?<=^<@!)\d+(?=>$)/)[0];
				badDatabase.get(userToTrick).trick += 1;
				msg.channel.send(`You've set up a nasty trick for ${cmd.parsed[0]}`);
			}
			else msg.channel.send(`Hmm, I can't find ${cmd.parsed[0]}'s address...`);
		break;

	}
});
