module.exports = {
	name: 'pulse',
	description: 'Check if the bot is alive',
	execute(message) {
		return message.channel.send("I'm still alive. \nBut you won't be for long.");
	},
};
