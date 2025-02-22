require('dotenv').config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const eventEnd = require("./parts/eventEnd");
const config = require("./parts/config.json");
const timeFormat = require('./parts/timeFormat.js');
const cmdParse = require("./parts/commandParse.js");
const {randomEvent} = require("./parts/randomEvent.js");

client.commands = new Discord.Collection();
client.devcommands = new Discord.Collection();
const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));
const devcommandFiles = fs.readdirSync(`${__dirname}/devcommands`).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`${__dirname}/commands/${file}`);
	client.commands.set(command.name, command);
}

for(const file of devcommandFiles) {
	const devcommand = require(`${__dirname}/devcommands/${file}`);
	client.devcommands.set(devcommand.name, devcommand);
}

const cooldowns = new Discord.Collection();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity("the SCREAMS of the Innocent", {type: "LISTENING"})
	.then(() => {
		console.log("Successfully Set Activity");
	}).catch(err => {
		console.log("Failed to set own activity");
		console.log(err);
	});
});

let lastEvent = 0;
client.on('message', async message => {
	if(!message.guild || (process.env.testingserver && message.guild.name !== process.env.testingserver)) return;
	if(message.author.bot || !message.content.startsWith(process.env.testprefix || config.prefix)) return;

	let {command, args} = cmdParse(message.content);
	let commandTest2 = command;
	command = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
	if(!command) {
		if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== process.env.owner) return;
		command = client.devcommands.get(commandTest2) || client.devcommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandTest2))
		if(!command) return;
	}

	if(command.guildOnly && message.channel.type === 'dm') {
		return message.channel.send('I can\'t execute that command inside DMs!');
	}

	if(command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if(command.usage) {
			reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	const now = Date.now();
	if(!cooldowns.get(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = command.cooldown * 1000 || 0;

	//Ends the event at the auto shut off time from config.json (Change it to 10/31/YYYY 23:59:59 in UTC Epoch Unix Time)
	if(Math.floor(Date.now() / 1000) >= config.autoshutoff) {
		try {
			await eventEnd(message);

		} catch(err) {
			console.log("Failed to send 'Event Ended' message");
			console.log(err);
		}
		return;
	}

	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if(now < expirationTime) {
			let timeLeft = timeFormat((expirationTime - now) / 1000);

			if(typeof command.cooldownMessage == "function") return command.cooldownMessage(message, timeLeft);
			return message.reply(`Please wait ${timeLeft} before reusing the \`${command.name}\` command.`);
		}
	}

	try {
		if(typeof command.validate === "function" && !command.validate(message, args)) return;

		if(cooldownAmount > 0) {
			timestamps.set(message.author.id, now);
			//TODO: See if there is a way to remove this timeout
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		}

		command.execute(message, args);

		if(now > lastEvent + 1 && message.guild !== null && (typeof command.randomEvent == "boolean" && command.randomEvent)) {
			randomEvent(message);
			lastEvent = now;
		}
	} catch(error) {
		console.error(error);
		await message.reply('there was an error trying to execute that command!');
	}
});

client.once("reconnecting", () => {
	console.log("Reconnecting, whoops");
});

client.once("disconnect", () => {
	console.log("Disconnecting. Goodbye!");
});

client.login(process.env.discordtoken).catch(err => {
	console.log("Could not login");
	console.error(err);
	process.exit(1);
});