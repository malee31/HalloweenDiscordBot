const Discord = require("discord.js");
const client = require("./parts/bot.js");
const config = require("./parts/config.json");
const argFormat = require("./parts/format.js");
const cmdParse = require("./parts/commandParse.js");
const badDatabase = require("./parts/badDatabase.js");
const { eventsNow, forceStartEvent, randomEvent, cooldown } = require("./parts/randomEvent.js");

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
				if(Math.random() < 0.20) {
				senderData.balance += 7;
				badDatabase.get(cmd.parsed[0].match(/(?<=^<@!)\d+(?=>$)/)[0].balance -= 7;
				msg.channel.send("You knocked on ${cmd.parsed[0]}'s door but they weren't home. However there was candy outside it said to take ONE but you took 7 pieces. Don't be so greedy there won't be candy left for anyone else!");
				} else if (Math.random() < 0.8) {
				senderData.balance += 2;
				badDatabase.get(cmd.parsed[0].match(/(?<=^<@!)\d+(?=>$)/)[0].balance -= 2;
				msg.channel.send("You knocked on ${cmd.parsed[0]}'s door and they opened the door and gave you two piece of candy");
				} else {
  				msg.channel.send("You knocked on ${cmd.parsed[0]}'s door there was no response and the candy bucket outside is all empty.")
		break;

		case "pun":
			let chance = Math.random();
		  	if(chance < 0.1) {
				senderData.balance += 20;
				msg.channel.send("What instrument does a skeleton play? A trombone");
			} else if(chance < 0.25) {
				msg.channel.send("Did you know getting kissed by a vampire is a pain in the neck?");
			} else if(chance < 0.35) {
				msg.channel.send("Why do ghost make the best cheerleader? cuz they got lots of spirit.");
			} else if(chance < 0.45) {
				msg.channel.send("if you got it, huant it!");
			} else if(chance < 0.70) {
				msg.channel.send("I have some vampire puns but they suck");
			} else {
				msg.channel.send("Halloween's not the same if i can't be witch you");
			}	
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
	randomEvent(msg.channel);
});


function keywordHandler(msg) {
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
