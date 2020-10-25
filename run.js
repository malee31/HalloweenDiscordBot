require('dotenv').config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./parts/config.json");
const argFormat = require("./parts/format.js");
const cmdParse = require("./parts/commandParse.js");
const badDatabase = require("./parts/badDatabase.js");
const {randomEvent, clearEvents, currentEvents} = require("./parts/randomEvent.js");

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
	if(message.author.bot || !message.guild || (process.env.testingserver && message.guild.name !== process.env.testingserver)) return;
	keywordHandler(message);
	if(!message.content.startsWith(process.env.testprefix || config.prefix)) return;

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
			const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
			if(typeof command.cooldownMessage == "function") return command.cooldownMessage(message, timeLeft);
			return message.reply(`Please wait ${timeLeft} more second${timeLeft == 1 ? '' : 's'} before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	//TODO: See if there is a way to remove this timeout
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}

	if(now < lastEvent + 60) {
		randomEvent(message);
		lastEvent = now;
	}
});

client.once("reconnecting", () => {
	console.log("Reconnecting, whoops");
});

client.once("disconnect", () => {
	console.log("Disconnecting. Goodbye!");
});

client.login(process.env.discordtoken);

function keywordHandler(message) {
	let keyword = message.content.trim().toLowerCase();
	let eventLookup = [];
	switch(keyword) {
		case "approach":
		case "run":
			eventLookup = currentEvents().filter(events => events.type == "mystic" && events.channelId == message.channel.id);
			for(let mysticEvent of eventLookup) {
				if(mysticEvent.data.includes(message.author.id)) continue;

				mysticEvent.data.push(message.author.id);
				let mysticMsg = message.channel.messages.cache.find(msg => msg.id == mysticEvent.id);
				let mysticNewEmbed = new Discord.MessageEmbed(mysticMsg.embeds[0]);
				if(keyword == "approach") {
					let rand = Math.random();
					if(rand < 0.5){
						rand = Math.floor(rand * 21 + 10);
						badDatabase.get(message.author.id).balance += rand - 15;
						mysticNewEmbed.setFooter(`${mysticNewEmbed.footer ? mysticNewEmbed.footer.text : ""}\n🔮 The fortune teller vanishes, leaving ${rand} candies behind for ${message.author.username}#${message.author.discriminator}`);
					} else {
						badDatabase.get(message.author.id).balance -= 15;
						mysticNewEmbed.setFooter(`${mysticNewEmbed.footer ? mysticNewEmbed.footer.text : ""}\nThe fortune teller laughs and quickly vanishes, leaving ${message.author.username}#${message.author.discriminator} 15 candies poorer`);
					}
				} else {
					mysticNewEmbed.setFooter(`${mysticNewEmbed.footer ? mysticNewEmbed.footer.text : ""}\n${message.author.username}#${message.author.discriminator} ran away safetly!`);
				}
				mysticMsg.edit(mysticNewEmbed);
			}
		break;
	}
}