require('dotenv').config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./parts/config.json");
const argFormat = require("./parts/format.js");
const cmdParse = require("./parts/commandParse.js");
const {randomEvent} = require("./parts/randomEvent.js");

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`${__dirname}/commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity("the SCREAMS of the Innocent", {type: "LISTENING"});
});

let lastEvent = 0;
client.on('message', async message => {
	if(!message.guild || (process.env.testingserver && message.guild.name !== process.env.testingserver)) return;
	if(message.author.bot || !message.content.startsWith(process.env.testprefix || config.prefix)) return;

	let {command, args} = cmdParse(message.content);
	command = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
	if(!command) return;

	if(command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if(command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if(command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	const now = Date.now();
	if(!cooldowns.get(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = command.cooldown * 1000 || 0;

	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if(now < expirationTime) {
			let timeLeft = ((expirationTime - now) / 1000);
			let units = "seconds";

			console.log(timeLeft);

			if(timeLeft / 3600 >= 1) {
				timeLeft = timeLeft / 3600;
				units = timeLeft === 1 ? "hour" : "hours";
			} else if (timeLeft / 60 >= 1) {
				timeLeft = timeLeft / 60;
				units = timeLeft === 1 ? "minute" : "minutes";
			} else if(timeLeft === 1) {
				units = "second";
			}

			timeLeft = `${timeLeft.toFixed(1)} ${units}`;

			if(typeof command.cooldownMessage == "function") return command.cooldownMessage(message, timeLeft);
			return message.reply(`Please wait ${timeLeft} before reusing the \`${command.name}\` command.`);
		}
	}

	try {
		if(typeof command.validate === "function" && !command.validate(message, args)) return;

		timestamps.set(message.author.id, now);
		//TODO: See if there is a way to remove this timeout
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		command.execute(message, args);

		if(now < lastEvent + 2) {
			randomEvent(message);
			lastEvent = now;
		}
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.once("reconnecting", () => {
	console.log("Reconnecting, whoops");
});

client.once("disconnect", () => {
	console.log("Disconnecting. Goodbye!");
});

client.login(process.env.discordtoken);