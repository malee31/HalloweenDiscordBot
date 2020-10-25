const Discord = require("discord.js");
const config = require("./config.json");
const runningEvents = [];
let eventTimer = setInterval(clearEvents, config.eventTimerSpeed);

const reactevent = require("../randomEvents/reactevent.js");
const witchevent = require("../randomEvents/witchevent.js");

module.exports = {
	randomEvent(message) {
		if(Math.floor(Math.random() * 100 + 1)  < config.eventBaseChance) {
			forceStartEvent(message);
		}
	},
	forceStartEvent: forceStartEvent,
	currentEvents() {
		clearEvents();
		return runningEvents;
	},
	clearEvents
};

function forceStartEvent(message) {
	let channel = message.channel;
	let time = Date.now();

	let randomEventEmbed = new Discord.MessageEmbed()
	.setTitle("Random Event!")

	switch(config.enabledEvents[Math.floor(Math.random() * config.enabledEvents.length)]) {

		case "react":
			reactevent.execute(message);
		break;
		case "witch":
			witchevent.execute(message);
		break;

		case "mystic":
			randomEventEmbed.setDescription('"Hey!" A mysterious fortune teller beckons you towards them\n"You poor innocent child, if you send the spirits an offering, they may do you a favor in return..."\nDo you dare approach her? (approach/run) <Cost: 15 candies>')
			.setColor('#B13DFF')
			.setImage("https://cdn.discordapp.com/attachments/768224531126026295/769704291228581888/giphy.gif")
			.setFooter("");

			channel.send(randomEventEmbed).then(sentMsg => {
				startEvent({type: "mystic", startTime: time, channelId: sentMsg.channel.id, id: sentMsg.id, data: []});
			});
		break;

	}
}

function clearEvents(id) {
	let time = Date.now();
	for(let eventNum = 0; eventNum < runningEvents.length; eventNum++) {
		const thisEvent = runningEvents[eventNum];
		if(typeof config.eventDurations[thisEvent.type] == "undefined") throw "No default event duration in config";
		if(time >= thisEvent.start + config.eventDurations[thisEvent.type] || (typeof id !== "undefined" && thisEvent.id == id)) {
			runningEvents.splice(eventNum, 1);
			eventExpire(thisEvent);
			eventNum--;
		}
	}
}

function startEvent(startThis) {
	runningEvents.push(startThis);
}

function eventExpire(expiredEvent) {
	console.log(`Expired event ${expiredEvent.type}`);
}
