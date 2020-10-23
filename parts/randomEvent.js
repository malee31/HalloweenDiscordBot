const config = require("./config.json");
const client = require("./bot.js");

module.exports = {
	time: time,
	cooldown: cooldown,
	eventsNow: getCurrentEvents,
	forceStartEvent: forceStartEvent,
	randomEvent: randomEvent
};

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
}
