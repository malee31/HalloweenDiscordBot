const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'bag',
	description: 'Check how many candies you have',
	execute(message) {
		let bagEmbed = new Discord.MessageEmbed()
		.setColor('#FF7518')
		.setTitle(`Trick o' Treat Bag: ${message.author.username}#${message.author.discriminator}`)
		.setDescription(`You have ${badDatabase.get(message.author.id).balance} candies in your Trick o' Treat bag`)
		.setImage("https://media1.tenor.com/images/38109369073474ad9da629afae0c06d2/tenor.gif")
		.setFooter("Trick o' Treat!");

		return message.channel.send(bagEmbed);
	},
};
