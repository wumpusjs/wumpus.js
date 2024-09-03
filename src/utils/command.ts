import {
	Locale,
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from 'discord.js';
import { getFiles } from './file';
import CommandManager from '../classes/CommandManager';
import path from 'path';
import { SHA256 } from './crypto';
import Command from '../classes/Command';
import Wumpus from '../structures/wumpus';

export const getCommands = () =>
	getFiles('./src/commands', ['ts', 'js'], ['node_modules']);

export async function loadCommands(client: Wumpus) {
	const commands = await getCommands();

	if (!commands?.success)
		return client.logger.error('Failed to load commands');

	if (!commands.files.length) return client.logger.warn('No commands found');

	if (!client.command)
		client.command = new CommandManager(client, Locale.EnglishUS);

	commands.files.forEach((command) => {
		const { default: exportedContent } = require(path.join(
			process.cwd(),
			'src/commands',
			command
		));

		if (!(exportedContent instanceof Command))
			return client.logger.error(
				`Failed to load command ${command}, it does not export a Command instance`
			);

		client.command.addCommand(exportedContent);
	});
}

export async function putCommands(
	client: Wumpus,
	commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]
) {
	client.logger.info('Checking for changes in commands');
	if (client.temp) {
		let hash = SHA256(JSON.stringify(commands));
		if (hash === client.temp.get('command-hash')) {
			return client.logger.info(
				'No changes in commands, skipping reload'
			);
		} else {
			client.temp.set('command-hash', hash, true);
		}
	}

	const rest = new REST().setToken(process.env.TOKEN!);

	try {
		client.logger.info(
			`Started refreshing ${commands.length} application (/) commands.`
		);

		const data = (await rest.put(
			Routes.applicationCommands(process.env.APPLICATION_ID!),
			{ body: commands }
		)) as any;

		client.logger.info(
			`Successfully reloaded ${data?.length} application (/) commands.`
		);
	} catch (error) {
		console.error(error);
	}
}
