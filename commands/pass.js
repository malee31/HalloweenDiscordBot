module.exports = {
	name: 'pass',
	description: 'Your mom passes out candy to the Trick o\' Treaters',
	cooldown: 82800,
	execute(message) {
		return message.author.send("Have a SPOOKY👻 Halloween!");
	},
};
