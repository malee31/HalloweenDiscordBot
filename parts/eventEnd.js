const Discord = require("discord.js");

module.exports = async function eventEnd(message) {
	let eventEndEmbed = new Discord.MessageEmbed()
		.setColor('#5185ED')
		.setTitle("The Spooky Season Has Ended and Another Season Awaits")
		.setDescription("You rush home with your bags heavy with candy\nThe sound of jingling bells can be heard in the distance")
		.setImage("https://media1.tenor.com/images/8ba4d7a3c28d9d3477c17d691e87d761/tenor.gif")
		.setFooter('❄ A brush of the cold air reminds you of snow ❄');
	await message.channel.send(eventEndEmbed);
}