const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase");

module.exports = {
	name: 'mysticevent',
	description: 'A mysterious fortune teller beckons you towards them. Offer the spirits a sacrifice and they may give you something back...',
	// cooldown: 180,
	execute(message) {
		let randomEventEmbed = new Discord.MessageEmbed()
			.setTitle("Random Event!")
			.setDescription('"Hey!" A mysterious fortune teller beckons you towards them\n"You poor innocent child, if you send the spirits an offering, they may do you a favor in return..."\nDo you dare approach her? (approach/run) <Cost: 15 candies>')
			.setColor('#B13DFF')
			.setImage("https://cdn.discordapp.com/attachments/768224531126026295/769704291228581888/giphy.gif")

		return message.channel.send(randomEventEmbed).then(sentMsg => {
			let validResponses = ["approach", "run"];

			const messageCollector = sentMsg.channel.createMessageCollector((msg, user) => {
				return !user.bot && validResponses.includes(msg.content.toLowerCase());
			}, {max: 20, maxUsers: 10, time: 10000});

			let completed = [];

			messageCollector.on("collect", (msg) => {
				if(completed.includes(msg.author.id)) return;
				completed.push(msg.author.id);

				let mysticNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				if(msg.content.toLowerCase() === "approach") {
					let rand = Math.random();
					if(rand < 0.5){
						rand = Math.floor(rand * 21 + 10);
						badDatabase.get(message.author.id).balance += rand - 15;
						mysticNewEmbed.setFooter(`${mysticNewEmbed.footer ? mysticNewEmbed.footer.text : ""}\n🔮 The fortune teller vanishes, leaving ${rand} candies behind for ${message.author.username}#${message.author.discriminator}`);
					} else {
						badDatabase.get(message.author.id).balance -= 15;
						mysticNewEmbed.setFooter(`${mysticNewEmbed.footer ? mysticNewEmbed.footer.text : ""}\nThe fortune teller laughs and quickly vanishes, leaving ${message.author.username}#${message.author.discriminator} 15 candies poorer`);
					}
				} else {
					mysticNewEmbed.setFooter(`${mysticNewEmbed.footer ? mysticNewEmbed.footer.text : ""}\n${message.author.username}#${message.author.discriminator} ran away safetly!`);
				}
				sentMsg.edit(mysticNewEmbed);
			});
		}).catch(console.error);
	},
};