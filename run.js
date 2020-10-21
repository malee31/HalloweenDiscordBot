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
	switch(cmd.command) {
		case "greet":
			msg.author.send("Have a SPOOKY Halloween");
		break;
		case "trick":
			if(/^<@!\d+>$/.test(command.parsed[0])) msg.channel.send(`You've set up a nasty trick for ${command.parsed[0]}`);
			else msg.channel.send(`Hmm, I can't find ${command.parsed[0]}'s address...`);
		break;
		case "profile":
			msg.channel.send(`${msg.author.displayAvatarURL({ dynamic: true })}`);
		break;
		case "test":
			msg.channel.send("Yes, I'm alive. \nNo, you won't be for long.");
		break;
		case "id":
			msg.channel.send(`Your ID is: ${msg.author.id}`);
		break;
		case "increment":
			let userData = badDatabase.get(msg.author.id);
			userData.balance += 1;
			msg.reply(`Tick Tock: ${userData.balance}`);
	}
});

client.login(process.env.discordtoken);

client.once("reconnecting", () => {
	console.log("Reconnecting, whoops");
});

client.once("disconnect", () => {
	console.log("Disconnecting. Goodbye!");
});
