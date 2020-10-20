module.exports = {
	aliases: aliases,
	prefix: "-",
	substitutionPlaceholder: "substitutionplaceholder"
};

const commandAliases = {
	"bal": "balance"
};

function aliases(command)
{
	return commandAliases[command] ? commandAliases[command] : command;
}
