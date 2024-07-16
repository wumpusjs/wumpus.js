import { Client, Locale, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { getFiles } from "./file";
import { error, warn } from "./logger";
import CommandManager from "../classes/CommandManager";
import path from "path";

export const getCommands = () =>
	getFiles("./src/commands", ["ts", "js"], ["node_modules"]);

export async function loadCommands(
	client: Client & { command: CommandManager<Locale> }
) {
	const commands = await getCommands();

	if (!commands?.success) return error("Failed to load commands");

	if (!commands.files.length) return warn("No commands found");

	if (!client.command) client.command = new CommandManager(Locale.EnglishUS);

	commands.files.forEach((command) => {
		const { default: exportedContent } = require(path.join(
			process.cwd(),
			"src/commands",
			command
		));
		client.command.addCommand(exportedContent);
	});
}

export async function putCommands(commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
	const rest = new REST().setToken(process.env.TOKEN!);

	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.APPLICATION_ID!),
			{ body: commands }
		) as any;

		console.log(
			`Successfully reloaded ${data?.length} application (/) commands.`
		);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
}
