import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { loadCommands, putCommands } from "./utils/command";
import { loadEvents } from "./utils/event";
import TempManager from "./classes/TempManager";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as Client & {
	temp: TempManager;
};

async function main() {
	client.temp = new TempManager();
	await client.temp.load();

	await loadCommands(client as Client & { command: any, temp: TempManager });
	await loadEvents(client);

	await putCommands(client, (client as any).command.getCommandsJSON());

	client.login(process.env.TOKEN);
}

main();
