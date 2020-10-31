const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase");

module.exports = {
	name: 'announce',
	description: 'Announce the winners at the end of the event!',
	aliases: ["winners", "result", "results"],
	guildOnly: true,
	async execute(message) {
		let leaderboard = [];
		let allUsers = badDatabase.get();
		for(let userID in allUsers) {
			if(!allUsers.hasOwnProperty(userID)) continue;
			allUsers[userID].userID = userID;
			leaderboard.push(allUsers[userID]);
		}

		let announcementEmbed = new Discord.MessageEmbed()
			.setColor('#5185ED')
			.setTitle("Spooky Season Sovereigns")
			.setDescription("The Season Has Ended And The Victors Have Been Chosen")
			.setFooter('❄ The Mist Settles And Clouds Begin To Gather ❄');

		let previous;
		let index = -1;
		leaderboard = leaderboard.sort((a, b) => {
			return b.balance - a.balance;
		}).filter(player => {
			return player.balance > 0;
		});

		for(let player of leaderboard) {
			index++;
			let user = await message.client.users.fetch(player.userID);
			user = `${user.username}#${user.discriminator}`;

			let topText = "";
			let bottomText = "";

			switch(index + 1) {
				case 1:
					topText = "🥇 ";
					bottomText += "The Crowned Victor";
				break;
				case 2:
					topText = "🥈 ";
					bottomText += "Runner Up";
				break;
				case 3:
					topText = "🥉 ";
					bottomText += "Third Place";
				break;
				default:
					topText = "🎃 ";
					bottomText += `${previous - player.balance} Candies Behind #${index}`;
			}
			topText += `${user} - ${player.balance} 🍬`;

			announcementEmbed.addField(topText, bottomText);
			previous = player.balance;
		}

		return message.channel.send(announcementEmbed);
	},
};
