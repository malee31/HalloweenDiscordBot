module.exports = {
	name: 'greet',
	description: 'Sincere Greetings from the Bot',
	execute(message) {
		return message.author.send("Have a SPOOKY👻 Halloween!");
	},
};