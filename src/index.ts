import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { loadCommands } from "./utils/command";
import { loadEvents } from "./utils/event";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

loadCommands(client as Client & { command: any });
loadEvents(client);

console.log("Logging in...", process.env.TOKEN);

client.login(process.env.TOKEN);
