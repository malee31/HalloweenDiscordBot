const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.js");
const argParse = require("./arguments.js");
const argFormat = require("./format.js");
const badDatabase = require("./badDatabase.js");

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity("the SCREAMS of the Innocent", {type: "LISTENING"});
});

client.on('message', async msg => {
	const hasText = Boolean(msg.content);
	const hasImage = msg.attachments.size !== 0;
	const hasEmbed = msg.embeds.length !== 0;
	if(msg.author.bot || !(hasText || hasImage || hasEmbed) || !msg.content.startsWith(config.prefix)) return;

	let content = msg.content.slice(config.prefix.length).trim();

	let processCommand = content.trim().split(/ |\n+/g);
	let cmd = {
		command: config.aliases(processCommand.shift().toLowerCase()),
		args: processCommand.join(" ").trim(),
		parsed: argParse(processCommand.join(" "))
	};

	let userData = badDatabase.get(msg.author.id);
	switch(cmd.command) {
		case "greet":
			msg.author.send("Have a SPOOKY Halloween");
		break;
		case "trick":
			if(/^<@!\d+>$/.test(cmd.parsed[0])) {
				console.log();
				badDatabase.get(cmd.parsed[0].match(/(?<=^<@!)\d+(?=>$)/)[0]).trick += 1;
				msg.channel.send(`You've set up a nasty trick for ${cmd.parsed[0]}`);
			}
			else msg.channel.send(`Hmm, I can't find ${cmd.parsed[0]}'s address...`);
		break;
		case "profile":
			msg.channel.send(`You have ${userData.balance} candies in your Trick O' Treat bag`);
		break;
		case "test":
			msg.channel.send("Yes, I'm alive. \nNo, you won't be for long.");
		break;
		case "id":
			msg.channel.send(`Your ID is: ${msg.author.id}`);
		break;
		case "allowance":
			let allowance = Math.floor(Math.random() * 1000);
			userData.balance += allowance;
			msg.channel.send(`Your mom gave you an allowance\nYou bought ${allowance} candies with it`);
		break;
	}
});

client.login(process.env.discordtoken);

client.once("reconnecting", () => {
	console.log("Reconnecting, whoops");
});

client.once("disconnect", () => {
	console.log("Disconnecting. Goodbye!");
});
