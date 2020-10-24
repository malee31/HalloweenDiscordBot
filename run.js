require('dotenv').config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./parts/config.json");
const argFormat = require("./parts/format.js");
const cmdParse = require("./parts/commandParse.js");
const badDatabase = require("./parts/badDatabase.js");

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
	if(message.author.bot) return;
	//keywordHandler(message);
	if(!message.content.startsWith(config.prefix)) return;

	let {command, args} = cmdParse(message.content);
	command = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

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
	if(!cooldowns.get(command.name)) cooldowns.set(command.name, new Discord.Collection());
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if(now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second${timeLeft.toFixed(1) == 1 ? '' : 's'} before reusing the \`${command.name}\` command.`);
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

	/*if(!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}*/

	/*let senderData = badDatabase.get(msg.author.id);
	let remainingCooldown = 0;

	switch(cmdParsed.command) {

		case "forcestartevent":
			if(msg.member.hasPermission("ADMINISTRATOR")) {
				forceStartEvent(msg.channel);
			}
		break;

		case "currentevents":
			msg.channel.send(JSON.stringify(eventsNow()));
		break;

		case "greet":
			msg.author.send("Have a SPOOKY👻 Halloween!");
		break;

		case "pass": 
			remainingCooldown = cooldown("pass", senderData);
			if(remainingCooldown !== -1) {
				msg.channel.send(`If you take all the candy, your mom will get mad!\nCooldown: ${remainingCooldown}`);
				return;
			}

			let pass = Math.floor(Math.random() * 31) + 25;
			senderData.balance += pass;
			msg.channel.send(`Your mom gave out candy and had ${pass} candies left over for you\nHere, you can take it!`);
		break;

		case "boo":
			remainingCooldown = cooldown("boo", senderData);
			if(remainingCooldown !== -1) {
				msg.channel.send(`All the kids have already been scared off. Now to wait...\nCooldown: ${remainingCooldown}`);
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

		case "leaderboard":
			let allUsers = badDatabase.get();

			let leaderboardEmbed = new Discord.MessageEmbed()
			.setColor('#FF7518')
			.setTitle("Top Trick o' Treaters")
			.setDescription("It's a race to the top")
			.setThumbnail(msg.guild.iconURL({dynamic: true}))
			.setImage("https://media1.tenor.com/images/cbe3dc34cec7df2df230e064fc173d39/tenor.gif")
			.setFooter('🕸️ Get to the top before Spooky Season ends 🕸️');

			let previous;
			let index = 0;
			let lead = msg.guild.members.cache.filter(member => {
				return typeof allUsers[member.user.id] !== "undefined";
			}).sort((a, b) => {
				return allUsers[b.user.id].balance - allUsers[a.user.id].balance;
			}).forEach(member => {
				if(allUsers[member.user.id].balance == 0) return;
				let marker = "🎃 ";
				leaderboardEmbed.addField(`${marker}${allUsers[member.user.id].balance} Candies - ${member.user.username}#${member.user.discriminator}`, (typeof previous == "undefined" ? "The Ruler of Trick o' Treating!" : `${previous - allUsers[member.user.id].balance} Candies behind #${index}`));
				previous = allUsers[member.user.id].balance;
				index++;
			});
		
			msg.channel.send(leaderboardEmbed);
		break;

		case "bag":
			msg.channel.send(`You have ${senderData.balance} candies in your Trick o' Treat bag`);
		break;

		case "pulse":
			msg.channel.send("I'm still alive. \nBut you won't be for long.");
		break;

		case "knock":
			if(/^<@!\d+>$/.test(cmd.parsed[0])) {
				let userToTrick = cmd.parsed[0].match(/(?<=^<@!)\d+(?=>$)/)[0];
				badDatabase.get(userToTrick).trick += 1;
				msg.channel.send(`You visited ${cmd.parsed[0]} house while you were trick o' treating`);
			}
			else msg.channel.send(`Hmm, I can't find ${cmd.parsed[0]}'s address...`);
		break;

		case "trickotreat":
			remainingCooldown = cooldown("trickotreat", senderData);
			if(remainingCooldown !== -1) {
				msg.channel.send(`"Walk to the next house! Stop running or we're never trick o' treating again!"\n-Your Mom\nCooldown: ${remainingCooldown}`);
				return;
			}

			let chance = Math.random();
			if(chance < 0.1) {
				senderData.balance += 20;
				msg.channel.send("OHHH! This is a rich neighborhood! +20 candies");
			} else if(chance < 0.25) {
				senderData.balance -= 10;
				msg.channel.send("You got beat up by the kid in a full Batman costume. Ugh, rich kids. -10 candies");
			} else if(chance < 0.35) {
				msg.channel.send("Licorice and Bottle Caps don't qualify as candy. +0 candy");
			} else if(chance < 0.45) {
				senderData.balance += 1;
				msg.channel.send("\"Take One.\" Cheapskate. +1 candy");
			} else if(chance < 0.70) {
				senderData.balance += 5;
				msg.channel.send("\"That's a nice costume you've got, dear. Here you go, Happy Halloween.\" +5 candies");
			} else {
				msg.channel.send("No one answered the door");
			}
		break;

		case "shutdown":
			console.log(`Shutdown requested by: ${msg.author.username}#${msg.author.discriminator}`);
			msg.reply("The Hallows shall rise again\nAnd when that happens, no one will be safe").then(() => {
				process.exit();
			});
		break;

		default:
			return;

	}
	randomEvent(msg.channel);*/
});

/*const events = {
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
});*/

client.once("reconnecting", () => {
	console.log("Reconnecting, whoops");
});

client.once("disconnect", () => {
	console.log("Disconnecting. Goodbye!");
});

client.login(process.env.discordtoken);

/*function keywordHandler(msg) {
	let keyword = msg.content.trim().toLowerCase();
	let eventLookup = [];
	switch(keyword) {
		case "trick":
		case "treat":
			eventLookup = eventsNow().filter(events => events.type == "witch" && events.channelId == msg.channel.id);
			for(let witchEvent of eventLookup) {
				if(witchEvent.data.includes(msg.author.id)) continue;

				witchEvent.data.push(msg.author.id);
				let witchMsg = msg.channel.messages.cache.find(msg => msg.id == witchEvent.id);
				if(keyword == "treat") {
					if(Math.random() < 0.5){
						badDatabase.get(msg.author.id).balance += 15;
						witchMsg.edit(`${witchMsg.content}\n${msg.author.username}#${msg.author.discriminator} receives a mega bar! That's like 15 normal candy bars!`);
					} else {
						badDatabase.get(msg.author.id).balance -= 15;
						witchMsg.edit(`${witchMsg.content}\n${msg.author.username}#${msg.author.discriminator} was nearly knocked out by the witch's broom. You dropped 15 candies while running away`);
					}
				} else {
					witchMsg.edit(`${witchMsg.content}\n${msg.author.username}#${msg.author.discriminator} was too scared to visit the witch. They're missing out`);
				}
			}
		break;
		case "approach":
		case "run":
			eventLookup = eventsNow().filter(events => events.type == "mystic" && events.channelId == msg.channel.id);
			for(let mysticEvent of eventLookup) {
				if(mysticEvent.data.includes(msg.author.id)) continue;

				mysticEvent.data.push(msg.author.id);
				let mysticMsg = msg.channel.messages.cache.find(msg => msg.id == mysticEvent.id);
				if(keyword == "approach") {
					let rand = Math.random();
					if(rand < 0.5){
						rand = Math.floor(rand * 50 - 20);
						badDatabase.get(msg.author.id).balance += rand;
						mysticMsg.edit(`🔮 The fortune teller vanishes, leaving ${rand} candies behind for ${mysticMsg.content}\n${msg.author.username}#${msg.author.discriminator}`);
					} else {
						badDatabase.get(msg.author.id).balance -= 50;
						mysticMsg.edit(`${mysticMsg.content}\nThe spirits possess ${msg.author.username}#${msg.author.discriminator} and they briefly lose consciousness.\nWhen they woke up, the fortune teller was gone. Yet it feels as if the 50 candies weren't all that they lost`);
					}
				} else {
					badDatabase.get(msg.author.id).balance += 3;
					mysticMsg.edit(`${mysticMsg.content}\n${msg.author.username}#${msg.author.discriminator} ran away and found 3 candies.`);
				}
			}
		break;
	}
}

//randomEvents.js
let currentEvents = [];
let eventTimer = setInterval(eventClear, config.eventTimerSpeed);

function time() {
	return Math.floor(new Date().getTime() / 1000);
}

function eventClear(id) {
	for(let eventNum = 0; eventNum < currentEvents.length; eventNum++) {
		let thisEvent = currentEvents[eventNum];
		if(typeof config.eventDurations[thisEvent.type] == "undefined") throw "No default event duration in config";
		if(time() >= thisEvent.start + config.eventDurations[thisEvent.type] || (typeof id !== "undefined" && thisEvent.id == id)) {
			currentEvents.splice(eventNum, 1);
			eventExpire(thisEvent);
			eventNum--;
		}
	}
}

function cooldown(cooldownName, senderData) {
	if(typeof config.cooldowns[cooldownName] == "undefined") throw "No default cooldown in config";
	if(time() - senderData.cooldowns[cooldownName] < config.cooldowns[cooldownName]) {
		let cooldownTime = config.cooldowns[cooldownName] - (time() - senderData.cooldowns[cooldownName]);
		return (cooldownTime % 360 >= 1 ? `${Math.floor(cooldownTime / 360) / 10} hours` : (cooldownTime % 60 >= 1 ? `${Math.floor(cooldownTime / 6) / 10} minutes` : `${Math.floor(cooldownTime * 10) / 10} seconds`)) + " left";
	}

	senderData.cooldowns[cooldownName] = time();
	return -1;
}

function startEvent(eventObject) {
	currentEvents.push(eventObject);
}

function eventExpire(expiredEvent) {
	console.log(`Expired event ${expiredEvent.type}`);
}

function randomEvent(channel) {
	if(Math.floor(Math.random() * 100 + 1) < config.eventBaseChance) forceStartEvent(channel);
}

function forceStartEvent(channel) {
	switch(config.enabledEvents[Math.floor(Math.random() * config.enabledEvents.length)]) {

		case "react":
			channel.send("QUICK! PICK UP THE CANDY!!!").then(sentMsg => {
				startEvent({type: "react", startTime: time(), id: sentMsg.id, data: ["🍬", "🍫", "🍭", "🍪"]});
				sentMsg.react("🍬");
				sentMsg.react("🍫");
				sentMsg.react("🍭");
				sentMsg.react("🍪");
			}).catch(console.error);
		break;

		case "witch":
			channel.send("There is a Witch in your neighborhood that is passing out KING SIZED candy bars.\nType \"treat\" to visit and \"trick\" to ignore.").then(sentMsg => {
				startEvent({type: "witch", startTime: time(), channelId: sentMsg.channel.id, id: sentMsg.id, data: []});
			});
		break;

		case "mystic":
			channel.send('🔮"Hey!" A mysterious fortune teller beckons you towards them🔮\n"You poor innocent child, if you send the spirits an offering, they may do you a favor in return..."\nDo you dare approach her? (approach/run) <Cost: 50 candies>').then(sentMsg => {
				startEvent({type: "mystic", startTime: time(), channelId: sentMsg.channel.id, id: sentMsg.id, data: []});
			});
		break;

	}
}

client.on('messageReactionAdd', (reaction, user) => {
	//console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
	eventClear();
	if(user.bot) return;
	let eventLookup = eventsNow().find(events => events.id == reaction.message.id);
	if(typeof eventLookup == "undefined") return;
	switch(eventLookup.type) {
		case "react":
			let index = eventLookup.data.indexOf(reaction.emoji.name);
			if(index == -1) return;
			eventLookup.data.splice(index, 1);
			badDatabase.get(user.id).balance += 10;
			reaction.message.edit(`${reaction.message.content}\n${user.username}#${user.discriminator} got 10 ${reaction.emoji.name}`);
			eventClear(eventLookup.id);
		break;
	}
});

client.on('messageReactionRemove', (reaction, user) => {
	console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});

function getCurrentEvents() {
	eventClear();
	return currentEvents;
}*/
