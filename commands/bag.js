const Discord = require("discord.js");
const badDatabase = require("../parts/badDatabase.js");

module.exports = {
	name: 'bag',
	description: 'Check how many candies you have',
	execute(message, args) {
		let bagEmbed = new Discord.MessageEmbed()
		.setColor('#FF7518')
		.setTitle(`Trick o' Treat Bag: ${message.author.username}#${message.author.discriminator}`)
		.setDescription(`You have ${badDatabase.get(message.author.id).balance} candies in your Trick o' Treat bag`)
		.setFooter("Trick o' Treat!");

		if(args[0]) bagEmbed.setImage("https://media1.tenor.com/images/38109369073474ad9da629afae0c06d2/tenor.gif");

		return message.channel.send(bagEmbed);
	},
};