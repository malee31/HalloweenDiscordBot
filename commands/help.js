const { prefix } = require('../parts/config.json');
const timeFormat = require('../parts/timeFormat');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	execute(message, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Here are all my commands:');
			data.push(
				commands.map(command => {
					return `**${command.name}**: ${command.cooldown ? ` *[Cooldown: ${timeFormat(command.cooldown)}]*` : ""} ${command.description}`;
				})
				.join('\n')
			);
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

			return message.channel.send(data, { split: true });
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.cooldown) data.push(`**Cooldown:** ${timeFormat(command.cooldown)}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		message.channel.send(data, { split: true });
	},
};
