const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase");

module.exports = {
	name: 'reactevent',
	description: 'Someone has dropped their candy! Quick, rush to pick it up for yourself!',
	execute(message) {
		let randomEventEmbed = new Discord.MessageEmbed()
			.setTitle("🍬🍫 Sweet Streak 🍭🍬")
			.setDescription("Someone has tripped and spilled their candy on the ground!\nRush to pick some up for yourself!")
			.setColor('#F8FF38')
			.setImage("https://media1.tenor.com/images/9e9cde402d3774bf59b4627219ed7c0c/tenor.gif");

		return message.channel.send(randomEventEmbed).then(sentMsg => {
			let validEmojis = ["🍬", "🍫", "🍭", "🍪"];
			let footerText = "";
			for(const emoji of validEmojis) {
				sentMsg.react(emoji).catch(err => {
					console.log(`Failed to react with ${emoji}. Check error bellow`);
					console.error(err);
				});
			}

			const reactCollector = sentMsg.createReactionCollector((reaction, user) => {
				return !user.bot && validEmojis.includes(reaction.emoji.name);
			}, {max: 20, maxEmojis: 20, maxUsers: 10, time: 10000});

			reactCollector.on("collect", (reaction, user) => {
				let index = validEmojis.indexOf(reaction.emoji.name);
				if(index === -1) return;
				validEmojis.splice(index, 1);

				badDatabase.get(user.id).balance += 10;
				let reactionNewEmbed = new Discord.MessageEmbed(reaction.message.embeds[0]);
				footerText += `\n${user.username}#${user.discriminator} got 10 ${reaction.emoji.name}`;
				reactionNewEmbed.setFooter(footerText);

				if(validEmojis.length === 0) {
					// console.log("ALL CLAIMED");
					reactCollector.stop("All candy claimed");
					return;
				}

				reaction.message.edit(reactionNewEmbed);
			});

			reactCollector.on("end", () => {
				let reactionNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				reactionNewEmbed
					.setDescription("The candy has all been picked up off the ground and into your bags")
					.setImage(null)
					.setFooter(footerText);
				return sentMsg.edit(reactionNewEmbed);
			});
		}).catch(console.error);
	},
};
