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
			let allowance = Math.floor(Math.random() * 35) + 25;
			senderData.balance += allowance;
			msg.channel.send(`Your mom gave out candy and had ${allowance} candies left over for you\nHere, you can take it!`);
		break;

		case "boo!":
		switch( ) {
			case 1:
			msg.channel.send("You scared the poor kid and they dropped 3 candies you ugly bastard!");
			return;
		}
		senderData.cooldowns.boo = time;
		senderData.balance += 3;
			break;
			case 2:
			msg.channel.send("You tried to scare the kid but they jumped you and stole your candy! -3 candies");
			return;
		}
		senderData.cooldowns.boo = time
		senderData.balance -= 3;
			break;

		case "profile":
			msg.channel.send(`You have ${senderData.balance} candies in your Trick O' Treat bag`);
		break;

		case "pulse":
			msg.channel.send("I'm still alive. \nBut you won't be for long.");
		break;

		case "knock":
			if(/^<@!\d+>$/.test(cmd.parsed[0])) {
				let userToTrick = cmd.parsed[0].match(/(?<=^<@!)\d+(?=>$)/)[0];
				badDatabase.get(userToTrick).trick += 1;
				msg.channel.send(`You visited ${cmd.parsed[0]} house while you were trick or treating`);
			}
			else msg.channel.send(`Hmm, I can't find ${cmd.parsed[0]}'s address...`);
		break;

	}
});
