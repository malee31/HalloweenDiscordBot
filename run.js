const Discord = require("discord.js");
const client = require("./parts/bot.js");
const config = require("./parts/config.json");
const cmdParse = require("./parts/commandParse.js");
const argFormat = require("./parts/format.js");
const badDatabase = require("./parts/badDatabase.js");

let time = Math.floor(new Date().getTime() / 1000);
let currentEvents = [];
let eventTimer = -1;

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
			let topMsg = "Top Trick O' Treaters\n"
			let lead = msg.guild.members.cache.filter(member => {
				return typeof allUsers[member.user.id] !== "undefined";
			}).sort((a, b) => {
				return allUsers[b.user.id].balance - allUsers[a.user.id].balance;
			}).forEach(member => {
				if(allUsers[member.user.id].balance == 0) return;
				topMsg += `${allUsers[member.user.id].balance} Candies - ${member.user.username}#${member.user.discriminator}\n`;
			});

			msg.channel.send(topMsg);
		break;

		case "profile":
			msg.channel.send(`You have ${senderData.balance} candies in your Trick O' Treat bag`);
		break;

		case "pulse":
			msg.channel.send("I'm still alive. \nBut you won't be for long.");
		break;

		case "react":
			msg.channel.send("QUICK! PICK UP THE CANDY!!!").then(sentMsg => {
				startEvent({type: "react", startTime: time, id: sentMsg.id, data: ["🍬", "🍫", "🍭", "🍪"]});
				sentMsg.react("🍬");
				sentMsg.react("🍫");
				sentMsg.react("🍭");
				sentMsg.react("🍪");
			}).catch(console.error);
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
	if(eventTimer !== -1) eventTimer = setInterval(eventClear, config.eventTimerSpeed);
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
