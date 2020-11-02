const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'testevent',
	description: 'Let\'s find out if events are working right',
	disabled: true,
	execute(message) {
		let randomEventEmbed = new Discord.MessageEmbed()
			.setTitle("👻🧙Costume Party🧛🧟")
			.setDescription("Pick out *ONE* costume to wear to the party!")
			.setColor('#E36024')
			.setImage("https://media1.tenor.com/images/0c2be1c446b8c50323e7dbf7d934f56e/tenor.gif");

		return message.channel.send(randomEventEmbed).then(sentMsg => {
			let validEmojis = ["👻", '🧙', "🧛", "🧟"];
			let footerText = "";
			let reactEmojis = validEmojis.slice();
			while(reactEmojis.length > 0) {
				let emoji = reactEmojis.splice(Math.floor(Math.random() * reactEmojis.length), 1)[0];
				sentMsg.react(emoji).catch(err => {
					console.log(`Failed to react with ${emoji}. Check error bellow`);
					console.error(err);
				});
			}

			const reactCollector = sentMsg.createReactionCollector((reaction, user) => {
				return !user.bot && validEmojis.includes(reaction.emoji.name);
			}, {max: 20, maxEmojis: 20, maxUsers: 10, time: 10000});

			let collected = [];
			reactCollector.on("collect", (reaction, user) => {
				if(collected.includes(user.id)) {
					//May fail if bot doesn't have MANAGE_MESSAGES permission
					if(sentMsg.guild.me.hasPermission("MANAGE_MESSAGES")) {
						reaction.users.remove(user.id);
					}
					return;
				}
				collected.push(user.id);

				let reactionNewEmbed = new Discord.MessageEmbed(reaction.message.embeds[0]);
				footerText += `\n${reaction.emoji.name} was chosen by ${user.username}#${user.discriminator}`;
				reactionNewEmbed.setFooter(footerText);

				return reaction.message.edit(reactionNewEmbed);
			});

			reactCollector.on("end", reactions => {
				let emoji = validEmojis[Math.floor(Math.random() * validEmojis.length)];
				let bestCostume = reactions.get(emoji);
				if(!bestCostume) bestCostume = [];
				else bestCostume = Array.from(bestCostume.users.cache.filter(user => !user.bot).keys());

				for(let winner of bestCostume) {
					badDatabase.get(winner).balance += 15;
				}

				let reactionNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				reactionNewEmbed
					.setDescription(`The ${emoji} have won the costume contest! +15 candies`)
					.setImage(null);

				return sentMsg.edit(reactionNewEmbed);
			})
		}).catch(console.error);
	},
};
