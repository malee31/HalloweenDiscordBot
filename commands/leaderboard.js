const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'leaderboard',
	description: 'Find out who\'s really at the top',
	aliases: ["top", "lead"],
	guildOnly: true,
	execute(message, args) {
		let allUsers = badDatabase.get();

		let leaderboardEmbed = new Discord.MessageEmbed()
		.setColor('#FF7518')
		.setTitle("Top Trick o' Treaters")
		.setDescription("It's a race to the top")
		.setThumbnail(message.guild.iconURL({dynamic: true}))
		.setImage("https://media1.tenor.com/images/cbe3dc34cec7df2df230e064fc173d39/tenor.gif")
		.setFooter('🕸️ Get to the top before Spooky Season ends 🕸️');

		let previous;
		let index = 0;
		let page = Number.parseInt(args[0]);
		if(isNaN(page) || page <= 0) page = 1;
		let lead = message.guild.members.cache.filter(member => {
			return typeof allUsers[member.user.id] !== "undefined";
		}).sort((a, b) => {
			return allUsers[b.user.id].balance - allUsers[a.user.id].balance;
		}).forEach(member => {
			if(allUsers[member.user.id].balance == 0 || index >= 10 * page || index < 10 * (page - 1)) return;
			let marker = "🎃 ";
			leaderboardEmbed.addField(`${marker}${allUsers[member.user.id].balance} Candies - ${member.user.username}#${member.user.discriminator}`, (typeof previous == "undefined" ? "The Ruler of Trick o' Treating!" : `${previous - allUsers[member.user.id].balance} Candies behind #${index}`));
			previous = allUsers[member.user.id].balance;
			index++;
		});

		return message.channel.send(leaderboardEmbed);
	},
};
