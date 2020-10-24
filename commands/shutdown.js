module.exports = {
	name: 'shutdown',
	description: 'Shutdown the bot for maintenance',
	execute(message) {
		console.log(`Shutdown requested by: ${message.author.username}#${message.author.discriminator}`);
		return message.reply("The Hallows shall rise again\nAnd when that happens, no one will be safe").then(() => {
			process.exit();
		});
	},
};
