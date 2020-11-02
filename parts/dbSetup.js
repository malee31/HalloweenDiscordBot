const fs = require('fs');

fs.access(`${__dirname}/../saveData.json`, fs.constants.F_OK | fs.constants.W_OK, (err) => {
	if(err) {
		if(err.code === 'ENOENT') {
			fs.writeFile(`${__dirname}/../saveData.json`, '{"users": {}}', (err) => {
				if(err) {
					console.log(`Error trying to create saveData.json: \n${err}`);
				}
				console.log('Created saveData.json');
			});
		}
	} else {
		console.log('saveData.json File Already Exists');
	}
});

fs.access(`${__dirname}/../.env`, fs.constants.F_OK | fs.constants.W_OK, (err) => {
	if(err) {
		if(err.code === 'ENOENT') {
			fs.writeFile(`${__dirname}/../.env`, 'discordtoken="Insert your Discord Bot Token in these quotes"', (err) => {
				if(err) {
					console.log(`Error trying to create .env file: \n${err}`);
				}
				console.log('Created .env file');
			});
		}
	} else {
		console.log('.env File Already Exists');
	}
});