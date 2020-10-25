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

client.on('message', async message => {
	if(!message.guild || (process.env.testingserver && message.guild.name !== process.env.testingserver)) return;
	console.log("Guild: " + message.guild.name);
	if(message.author.bot) return;
	keywordHandler(message);
	if(!message.content.startsWith(process.env.testprefix || config.prefix)) return;

	let {command, args} = cmdParse(message.content);
	command = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
	if(!command) return;

	if(command.guildOnly && message.channel.type == 'dm') {
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

	randomEvent(message.channel);
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;
	const user = client.users.cache.get(data.user_id);
	const channel = client.channels.cache.get(data.channel_id);

	if (channel.messages.cache.has(data.message_id)) return;

	const message = await channel.messages.fetch(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	const reaction = message.reactions.cache.get(emojiKey);

	client.emit(events[event.t], reaction, user);
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
		case "trick":
		case "treat":
			eventLookup = currentEvents().filter(events => events.type == "witch" && events.channelId == message.channel.id);
			for(let witchEvent of eventLookup) {
				if(witchEvent.data.includes(message.author.id)) continue;

				witchEvent.data.push(message.author.id);
				let witchMsg = message.channel.messages.cache.find(msg => msg.id == witchEvent.id);
				let witchNewEmbed = new Discord.MessageEmbed(witchMsg.embeds[0]);
				if(keyword == "treat") {
					if(Math.random() < 0.5){
						badDatabase.get(message.author.id).balance += 15;
						witchNewEmbed.setFooter(`${witchNewEmbed.footer ? witchNewEmbed.footer.text : ""}\n${message.author.username}#${message.author.discriminator} receives a mega bar! That's like 15 normal candy bars!`);
					} else {
						badDatabase.get(message.author.id).balance -= 15;
						witchNewEmbed.setFooter(`${witchNewEmbed.footer ? witchNewEmbed.footer.text : ""}\n${message.author.username}#${message.author.discriminator} was nearly knocked out by the witch's broom. You dropped 15 candies while running away`);
					}
				} else {
					witchNewEmbed.setFooter(`${witchNewEmbed.footer ? witchNewEmbed.footer.text : ""}\n${message.author.username}#${message.author.discriminator} was too scared to visit the witch. They're missing out`);
				}
				witchMsg.edit(witchNewEmbed);
			}
		break;
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

//For randomEvents.js
client.on('messageReactionAdd', (reaction, user) => {
	//console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
	clearEvents();
	if(user.bot) return;
	let eventLookup = currentEvents().find(events => events.id == reaction.message.id);
	if(typeof eventLookup == "undefined") return;
	switch(eventLookup.type) {
		case "react":
			let index = eventLookup.data.indexOf(reaction.emoji.name);
			if(index == -1) return;
			eventLookup.data.splice(index, 1);
			badDatabase.get(user.id).balance += 10;
			let reactionNewEmbed = new Discord.MessageEmbed(reaction.message.embeds[0]);
			reactionNewEmbed.setFooter(`${reactionNewEmbed.footer ? reactionNewEmbed.footer.text : ""}\n${user.username}#${user.discriminator} got 10 ${reaction.emoji.name}`);
			reaction.message.edit(reactionNewEmbed);
			if(eventLookup.data.length == 0) clearEvents(eventLookup.id);
		break;
	}
});

client.on('messageReactionRemove', (reaction, user) => {
	console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});
