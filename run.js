const Discord = require("discord.js");
const client = require("./parts/bot.js");
const config = require("./parts/config.json");
const cmdParse = require("./parts/commandParse.js");
const argFormat = require("./parts/format.js");
const badDatabase = require("./parts/badDatabase.js");

let time = Math.floor(new Date().getTime() / 1000);
let currentEvents = [];
let eventTimer = setInterval(eventClear, config.eventTimerSpeed);

client.on('message', async msg => {
	if(msg.author.bot) return;
	keywordHandler(msg);
	if(!msg.content.startsWith(config.prefix)) return;

	let cmd = cmdParse(msg.content);
	let senderData = badDatabase.get(msg.author.id);
	let remainingCooldown = 0;

	switch(cmd.command) {

		case "forcestartevent":
			if(msg.member.hasPermission("ADMINISTRATOR")) {
				forceStartEvent(msg.channel);
			}
		break;

		case "greet":
			msg.author.send("Have a SPOOKY👻 Halloween!");
		break;

		case "pass": 
			remainingCooldown = cooldown("pass", senderData);
			if(remainingCooldown !== -1) {
				msg.channel.send(`If you take all the candy, your mom will get mad!\nCooldown: ${remainingCooldown}s left`);
				return;
			}

			let pass = Math.floor(Math.random() * 31) + 25;
			senderData.balance += pass;
			msg.channel.send(`Your mom gave out candy and had ${pass} candies left over for you\nHere, you can take it!`);
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
				msg.channel.send(`"Walk to the next house! Stop running or we're never trick o' treating again!"\n-Your Mom\nCooldown: ${remainingCooldown}s left`);
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

		default:
			return;

	}
	randomEvent(msg.channel);
});

client.on('messageReactionAdd', (reaction, user) => {
	//console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
	eventClear();
	if(user.bot) return;
	let eventLookup = currentEvents.find(events => events.id == reaction.message.id);
	if(typeof eventLookup == "undefined") return;
	switch(eventLookup.type) {
		case "react":
			let index = eventLookup.data.indexOf(reaction.emoji.name);
			if(index == -1) return;
			eventLookup.data.splice(index, 1);
			badDatabase.get(user.id).balance += 10;
			reaction.message.edit(`${reaction.message.content}\n${user.username}#${user.discriminator} got 10 ${reaction.emoji.name}`);
		break;
	}
});

client.on('messageReactionRemove', (reaction, user) => {
	console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});

function cooldown(cooldownName, senderData) {
	if(time - senderData.cooldowns[cooldownName] < config.cooldowns[cooldownName]) {
		return config.cooldowns[cooldownName] - (time - senderData.cooldowns[cooldownName]);
	}

	senderData.cooldowns[cooldownName] = time;
	return -1;
}

function startEvent(eventObject) {
	currentEvents.push(eventObject);
}

function eventClear(id) {
	time = Math.floor(new Date().getTime() / 1000);
	for(let eventNum = 0; eventNum < currentEvents.length; eventNum++) {
		let thisEvent = currentEvents[eventNum];
		if(time >= thisEvent.start + config.eventDurations[thisEvent.type] || (typeof id !== "undefined" && thisEvent.id == id)) {
			currentEvents.splice(eventNum, 1);
			eventExpire(thisEvent);
			eventNum--;
		}
	}
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
				startEvent({type: "react", startTime: time, id: sentMsg.id, data: ["🍬", "🍫", "🍭", "🍪"]});
				sentMsg.react("🍬");
				sentMsg.react("🍫");
				sentMsg.react("🍭");
				sentMsg.react("🍪");
			}).catch(console.error);
		break;

		case "witch":
			channel.send("There is a Witch in your neighborhood that is passing out KING SIZED candy bars.\nType \"treat\" to visit and \"trick\" to ignore.").then(sentMsg => {
				startEvent({type: "witch", startTime: time, channelId: sentMsg.channel.id, id: sentMsg.id, data: []});
			});
		break;

	}
}

function keywordHandler(msg) {
	let keyword = msg.content.trim().toLowerCase();
	switch(keyword) {
		case "trick":
		case "treat":
			let eventLookup = currentEvents.filter(events => events.type == "witch" && events.channelId == msg.channel.id);
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
	}
}
