module.exports = {
	name: 'greet',
	description: 'Sincere Greetings from the Bot',
	cooldown: 5,
	execute(message) {
		return message.author.send("Have a SPOOKY👻 Halloween!");
	},
};
