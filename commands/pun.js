const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'pun',
	description: 'Haha. Funny.',
	cooldown: 1,
	execute(message) {
		let chance = Math.random();
		let pun = "";
		if(chance < 0.1) {
			badDatabase.get(message.author.id).balance += 15;
			pun = "What instrument does a skeleton play? A trombone.";
		} else if(chance < 0.25) {
			pun = "Did you know getting kissed by a vampire is a pain in the neck?";
		} else if(chance < 0.35) {
			pun = "Why do ghost make the best cheerleader? Because they got lots of spirit!";
		} else if(chance < 0.45) {
			pun = "If you got it, haunt it!";
		} else if(chance < 0.70) {
			pun = "I have some vampire puns but they suck...";
		} else {
			pun = "Halloween's not the same if I can't be witch you~";
		}
		return message.channel.send(pun);
	},
};
