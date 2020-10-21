const Discord = require("discord.js");
const client = require("./parts/bot.js");
const config = require("./parts/config.json");
const cmdParse = require("./parts/commandParse.js");
const argFormat = require("./parts/format.js");
const badDatabase = require("./parts/badDatabase.js");

let time = Math.floor(new Date().getTime() / 1000);

client.on('message', async msg => {
	if(msg.author.bot || !msg.content.startsWith(config.prefix)) return;

	let cmd = cmdParse(msg.content);
	let senderData = badDatabase.get(msg.author.id);
	let remainingCooldown = 0;
	time = Math.floor(new Date().getTime() / 1000);

	switch(cmd.command) {

		case "greet":
			msg.author.send("Have a SPOOKY Halloween");
		break;

		case "pass":
			remainingCooldown = cooldown("candy", senderData);
			if(remainingCooldown !== -1) {
				msg.channel.send(`If you take all the candy, your mom will get mad!\nCooldown: ${remainingCooldown}s left`);
				return;
			}

			let candy = Math.floor(Math.random() * 35) + 25;
			senderData.balance += candy;
			msg.channel.send(`Your mom gave out candy and had ${candy} candies left over for you\nHere, you can take it!`);
		break;

		case "boo":
			remainingCooldown = cooldown("boo", senderData);
			if(remainingCooldown !== -1) {
				msg.channel.send(`All the kids have already been scared off. Now to wait...\nCooldown: ${remainingCooldown}s left`);
				return;
			}

			if(Math.random() < 0.5) {
				senderData.balance += 3;
				msg.channel.send("You scared the poor kid and they dropped 3 candies you ugly bastard!");
			} else {
				senderData.balance -= 3;
				msg.channel.send("You tried to scare the kid but they jumped you and stole your candy! -3 candies");
			}
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

function cooldown(cooldownName, senderData) {
	if(time - senderData.cooldowns[cooldownName] < config.cooldowns[cooldownName]) {
		return config.cooldowns[cooldownName] - (time - senderData.cooldowns[cooldownName]);
	}

	senderData.cooldowns[cooldownName] = time;
	return -1;
}
