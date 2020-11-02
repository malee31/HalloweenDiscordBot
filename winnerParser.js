//For basic sorting without needing to start up the bot
const data = require("./saveData.json");

const allUsers = [];

for(let userID in data.users) {
	if(!data.users.hasOwnProperty(userID)) continue;
	data.users[userID].userID = userID;
	allUsers.push(data.users[userID]);
}

allUsers.sort((a, b) => {
	return b.balance - a.balance;
}).filter(player => {
	return player.balance > 0;
}).forEach(player => {
	console.log(`🎃 ${player.balance} - <@${player.userID}>`);
});