const config = require("./config.json");

module.exports = commandInput => {
	let content = commandInput.slice(config.prefix.length).trim();

	let splitCmd = content.split(/ |\n+/g);

	let cmd = {
		command: splitCmd.shift().toLowerCase(),
		args: splitCmd.join(" "),
		parsed: parseArguments(splitCmd.join(" "))
	};

	if(config.aliases[cmd.command]) cmd.command = config.aliases[cmd.command];

	return cmd;
}

function parseArguments(joinedArgs) {
	if(typeof joinedArgs !== "string" || joinedArgs.length == 0) return [];

	let strings = joinedArgs.match(/'([^']+)'/g);
	joinedArgs = joinedArgs.replace(config.substitutionPlaceholder, "");
	joinedArgs = joinedArgs.replace(/'([^']+)'/g, config.substitutionPlaceholder);

	let args = joinedArgs.split(/ |\n+/g);
	for(let argNum = 0; argNum < args.length; argNum++) {
		if(!Array.isArray(strings) || strings.length == 0) break;
		let substitutee = strings[0];
		substitutee = substitutee.substring(1, substitutee.length - 1);
		if(args[argNum] == config.substitutionPlaceholder) {
			args[argNum] = substitutee;
			strings.shift();
		} else if(args[argNum].includes(config.substitutionPlaceholder)) {
			args[argNum] = args[argNum].replace(config.substitutionPlaceholder, "");
			args.splice(argNum, 0, substitutee);
			strings.shift();
		}
	}
	return args;
}
