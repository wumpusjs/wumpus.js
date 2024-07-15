import { Client, Locale } from "discord.js";
import { getFiles } from "./file";
import { error, warn } from "./logger";
import CommandManager from "../classes/CommandManager";
import path from "path";

export const getCommands = () =>
	getFiles("./src/commands", ["ts", "js"], ["node_modules"]);

export async function loadCommands(client: Client & { command: CommandManager<Locale> }) {
	const commands = await getCommands();
	
	if (!commands?.success) return error("Failed to load commands");

	if (!commands.files.length) return warn("No commands found");

	if (!(client as any).command) client.command = new CommandManager(Locale.EnglishUS);

	commands.files.forEach((command) => {
		const { default: exportedContent } = require(path.join(process.cwd(), "src/commands", command));
		(client as any).command.addCommand(exportedContent);
	});

	console.log("Commands loaded", (client as any).command);
}