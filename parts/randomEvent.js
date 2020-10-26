const config = require("./config.json");
const fs = require("fs");
const randomEventFiles = fs.readdirSync(`${__dirname}/../randomEvents`).filter(file => file.endsWith('.js'));
const events = {};
const eventKeys = [];

for(const file of randomEventFiles) {
	const eventFile = require(`${__dirname}/../randomEvents/${file}`);
	//Still loads file even if disabled for force starting
	events[eventFile.name] = eventFile;
	if(eventFile.disabled) continue;
	eventKeys.push(eventFile.name);
}

module.exports = {
	randomEvent(message) {
		if(Math.floor(Math.random() * 100 + 1)  < config.eventBaseChance) {
			forceStartEvent(message);
		}
	},
	forceStartEvent: forceStartEvent
};

function forceStartEvent(message, eventName) {
	if(eventName && events[eventName]) {
		events[eventName].execute(message);
		return;
	}
	events[eventKeys[Math.floor(Math.random() * eventKeys.length)]].execute(message);
}