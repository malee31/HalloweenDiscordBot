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
	let time = Math.floor(new Date().getTime() / 1000);

	switch(cmd.command) {

		case "greet":
			msg.author.send("Have a SPOOKY Halloween");
		break;

		case "pass":
			if(time - senderData.cooldowns.allowance < config.cooldowns.allowance) {
				msg.channel.send(`If you take all the candy, your mom will get mad!\nCooldown: ${config.cooldowns.allowance - (time - senderData.cooldowns.allowance)}s left`);
				return;
			}
			senderData.cooldowns.allowance = time;
			let allowance = Math.floor(Math.random() * 30) + 30;
			senderData.balance += allowance;
			msg.channel.send(`Your mom gave out candy and had ${allowance} candies left over for you\nHere, you can take it!`);
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
