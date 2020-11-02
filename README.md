# Halloween Discord Bot
----------------------
This Discord Bot was made for a Halloween event on Sophie's WHOLE Circus 🤹🎭🎪🌝🌚🤡 Discord Server.
Collect Candies and participate in random events to be the best Trick O' Treater around!

## Setup
To set up the bot, set up the bad JSON database by running the `dbSetup.js` file in the `parts/` folder.</br>
The setup script will also create a `.env` file at the project root which will have to contain the Discord Bot's token inside the quotes.</br>
Once this is done, run `npm install` to install the dependencies required for the project and run `npm start` or `node .` to turn the bot on.

## Adjustments
Small adjustments such as changing the prefix or how often the bot saves everyone's balances can be done in the `config.json` file inside of the `parts/` folder.</br>
All code for commands are in the `commands/` folder and can be changed up there.</br>
Cooldowns can be adjusted in each of their respective commands and are measured in seconds.

## Recommendations
For the Halloween Event this bot was first used for, cooldowns started very low resulting in high amounts of spam. Next time the bot is run, it may be better to start with relatively low cooldowns (Like the cooldowns in place as of the writing of this README.md) and end on low cooldowns.</br>
During the running time of the event, cooldowns were manually adjusted everyday, increasing in the first two days sharply then gradually lowering each day after that as less people use it to prevent spam.</br>
The `rob` command is currently overpowered and so it will always have one of the highest cooldowns and until it is nerfed, it will have to stay that way.
