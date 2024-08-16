import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands, putCommands } from './utils/command';
import { loadEvents } from './utils/event';
import TempManager from './classes/TempManager';
import { loadMiddlewares } from './utils/middlewares';
import MiddlewareManager from './classes/MiddlewareManager';

dotenv.config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
}) as Client & {
	temp: TempManager;
};

async function main() {
	client.temp = new TempManager();
	await client.temp.load();
	
	await loadMiddlewares(client as Client & { middleware: MiddlewareManager, temp: TempManager });
	await loadCommands(client as Client & { command: any; temp: TempManager });
	await loadEvents(client);

	await putCommands(client, (client as any).command.getCommandsJSON());

	client.login(process.env.TOKEN);
}

main();
