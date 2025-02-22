module.exports = {
	name: 'shutdown',
	description: 'Shutdown the bot for maintenance. Requires permission ADMINISTRATOR',
	validate(message) {
		console.log(`Event requested by: ${message.author.username}#${message.author.discriminator}`);
		if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== process.env.owner) {
			message.reply("You have no authority here. Kneel.");
			return false;
		}
		return true;
	},
	execute(message) {
		console.log(`Shutdown requested by: ${message.author.username}#${message.author.discriminator}`);
		if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== process.env.owner) return message.reply("The night has refused your commands");
		return message.reply("The Hallows shall rise again\nAnd when that happens, no one will be safe").then(() => {
			console.log(`Shutdown completed from: ${message.author.username}#${message.author.discriminator}`);
			process.exit();
		});
	},
};