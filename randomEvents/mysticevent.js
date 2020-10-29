const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase");

module.exports = {
	name: 'mysticevent',
	description: 'A mysterious fortune teller beckons you towards them. Offer the spirits a sacrifice and they may give you something back...',
	// cooldown: 180,
	execute(message) {
		let randomEventEmbed = new Discord.MessageEmbed()
			.setTitle("Random Event!")
			.setDescription('"Hey!" A mysterious fortune teller beckons you towards them\n"You poor innocent child, if you speak to the spirits, they may do you a favor in return..."\nDo you dare approach her? (approach/run)')
			.setColor('#B13DFF')
			.setImage("https://cdn.discordapp.com/attachments/768224531126026295/769704291228581888/giphy.gif");

		return message.channel.send(randomEventEmbed).then(sentMsg => {
			let validResponses = ["approach", "run"];
			let completed = [];
			let footerText = "";

			const messageCollector = sentMsg.channel.createMessageCollector(msg => {
				return !msg.author.bot && validResponses.includes(msg.content.toLowerCase()) && !completed.includes(msg.author.id);
			}, {max: 20, maxUsers: 10, time: 10000});

			messageCollector.on("collect", msg => {
				if(completed.includes(msg.author.id)) return;
				completed.push(msg.author.id);

				let mysticNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				if(msg.content.toLowerCase() === "approach") {
					let rand = Math.random();
					if(rand < 0.5){
						rand = Math.floor(rand * 16 + 5);
						badDatabase.get(msg.author.id).balance += rand;
						footerText += `\n🔮 The fortune teller vanishes, leaving ${rand} candies behind for ${msg.author.username}#${msg.author.discriminator}`;
					} else {
						badDatabase.get(msg.author.id).balance -= 15;
						footerText += `\nThe fortune teller laughs and quickly vanishes, leaving ${msg.author.username}#${msg.author.discriminator} 15 candies poorer`;
					}
				} else {
					footerText += `\n${msg.author.username}#${msg.author.discriminator} ran away safetly!`;
				}
				mysticNewEmbed.setFooter(footerText);
				sentMsg.edit(mysticNewEmbed);
			});
		}).catch(console.error);
	},
};