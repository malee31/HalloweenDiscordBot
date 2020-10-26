const Discord = require("discord.js");

module.exports = {
	name: 'testevent',
	description: 'Let\'s find out if events are working right',
	disabled: true,
	// cooldown: 180,
	execute(message) {
		let randomEventEmbed = new Discord.MessageEmbed()
			.setTitle("Random Event!")
			.setDescription('I have no idea what went wrong.\nType \"test\" to help check.')
			.setColor('#0EB533');

		return message.channel.send(randomEventEmbed).then(sentMsg => {
			let validResponses = ["test"];
			let completed = [];

			const messageCollector = sentMsg.channel.createMessageCollector(msg => {
				if(!msg.author.bot) msg.channel.send(`Received response from ${msg.author.toString()}\n${!msg.author.bot && validResponses.includes(msg.content.toLowerCase()) && !completed.includes(msg.author.id) ? "Accepted" : "Ignored"}`);
				return !msg.author.bot && validResponses.includes(msg.content.toLowerCase()) && !completed.includes(msg.author.id);
			}, {max: 20, maxUsers: 10, time: 10000});


			messageCollector.on("collect", msg => {
				if(completed.includes(msg.author.id)) return;
				console.log(`Pushed: ${msg.author.id}`);
				console.log(msg.id);
				console.log(msg.author.username);
				completed.push(msg.author.id);

				let testNewEmbed = new Discord.MessageEmbed(sentMsg.embeds[0]);
				if(Math.random() < 0.5){
					testNewEmbed.setFooter(`${testNewEmbed.footer ? testNewEmbed.footer.text : ""}\n${msg.author.username}:${msg.author.id} existed!\n${completed}`);
				} else {
					testNewEmbed.setFooter(`${testNewEmbed.footer ? testNewEmbed.footer.text : ""}\n${message.author.username}:${msg.author.id} existed, but better\n${completed}`);
				}
				sentMsg.edit(testNewEmbed);
			});
		}).catch(console.error);
	},
};
