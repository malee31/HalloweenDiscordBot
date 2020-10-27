const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase");

module.exports = {
	name: 'witchevent',
	description: 'A witch is rumored to be passing out KING-SIZED candy bars! You aren\'t sure which witch it is... Do you dare to go visit one and try your luck?',
	// cooldown: 180,
	execute(message) {
		let randomEventEmbed = new Discord.MessageEmbed()
			.setTitle("Random Event!")
			.setDescription('There is a Witch in your neighborhood that is passing out KING SIZED candy bars.\nType \"treat\" to visit and \"trick\" to ignore.')
			.setColor('#0EB533')
			.setImage("https://media1.tenor.com/images/bed062b6c8a55f6aa375f944aecd7918/tenor.gif");

		return message.channel.send(randomEventEmbed).then(sentMsg => {
			let validResponses = ["trick", "treat"];

			let completed = [];
			let footerText = "";

			const messageCollector = sentMsg.channel.createMessageCollector(msg => {
				return !msg.author.bot && validResponses.includes(msg.content.toLowerCase()) && !completed.includes(msg.author.id);
			}, {max: 20, maxUsers: 10, time: 10000});

			messageCollector.on("collect", (msg) => {
				if(completed.includes(msg.author.id)) return;
				completed.push(msg.author.id);

				let witchNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				if(msg.content.toLowerCase() === "treat") {
					if(Math.random() < 0.5){
						badDatabase.get(msg.author.id).balance += 15;
						footerText += `\n${msg.author.username}#${msg.author.discriminator} receives a mega bar! That's like 15 normal candy bars!`;
					} else {
						badDatabase.get(msg.author.id).balance -= 15;
						footerText += `\n${msg.author.username}#${msg.author.discriminator} was nearly knocked out by the witch's broom. You dropped 15 candies while running away`;
					}
				} else {
					footerText += `\n${msg.author.username}#${msg.author.discriminator} was too scared to visit the witch. They're missing out`;
				}
				witchNewEmbed.setFooter(footerText);
				sentMsg.edit(witchNewEmbed);
			});
		}).catch(console.error);
	},
};