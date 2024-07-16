import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { loadCommands, putCommands } from "./utils/command";
import { loadEvents } from "./utils/event";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function main() {
	await loadCommands(client as Client & { command: any });
	await loadEvents(client);

	await putCommands((client as any).command.getCommandsJSON());
		
	client.login(process.env.TOKEN);
	
}

main();