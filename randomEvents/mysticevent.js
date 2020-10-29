const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase");

module.exports = {
	name: 'mysticevent',
	description: 'A mysterious fortune teller beckons you towards them. Offer the spirits a sacrifice and they may give you something back...',
	execute(message) {
		let randomEventEmbed = new Discord.MessageEmbed()
			.setTitle("🔮 A Mystical Corner 🔮")
			.setDescription('A mysterious fortune teller beckons you towards them\n"Offer yourself to the spirits"\n"They may bless you with something in return..."\nDo you dare approach her? (approach/run)')
			.setColor('#8428BE')
			.setImage("https://media1.tenor.com/images/927fdc64e22ebdfcc4c2fd5e73119604/tenor.gif");

		return message.channel.send(randomEventEmbed).then(sentMsg => {
			let validResponses = ["approach", "run", "yes", "no"];
			let completed = [];
			let footerText = "";

			const messageCollector = sentMsg.channel.createMessageCollector(msg => {
				return !msg.author.bot && validResponses.includes(msg.content.toLowerCase()) && !completed.includes(msg.author.id);
			}, {max: 20, maxUsers: 10, time: 10000});

			messageCollector.on("collect", msg => {
				if(completed.includes(msg.author.id)) return;
				completed.push(msg.author.id);

				let mysticNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				if(msg.content.toLowerCase() === validResponses[0] || msg.content.toLowerCase() === validResponses[1]) {
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
					footerText += `\n${msg.author.username}#${msg.author.discriminator} ran away!`;
				}
				mysticNewEmbed.setFooter(footerText);
				sentMsg.edit(mysticNewEmbed);
			});

			messageCollector.on("end", () => {
				let mysticNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				mysticNewEmbed
					.setDescription("The spirits have vanished from the streets")
					.setImage(null);
				sentMsg.edit(mysticNewEmbed);
			});
		}).catch(console.error);
	},
};