import { ChatInputCommandInteraction, Locale, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
import { error } from "../utils/logger";
import Command from "./Command";

export default class CommandManager<T extends Locale> {
	commands: Map<string, Command<any, T>> = new Map();
	defaultLanguage: Locale;

	constructor(defaultLanguage: Locale) {
		this.defaultLanguage = defaultLanguage;
	}

	addCommand(exportedContent: Command<any, T>): this {
		if (!(exportedContent instanceof Command)) {
			error("Command is not an instance of Command");
			return this;
		}

		const name =
			exportedContent.getName(this.defaultLanguage) ||
			exportedContent.name.values().next().value;

		if (!name) {
			error("Command name is missing");
			return this;
		}

		this.commands.set(name.toLowerCase(), exportedContent);

		return this;
	}

	handleInteraction(interaction: ChatInputCommandInteraction): void {
		const command = this.commands.get(
			interaction.commandName.toLowerCase()
		);

		if (!command) {
			return;
		}

		command.execute(interaction, interaction.options as any);
	}

	getCommandsJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
		const slashCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

		for (const [, command] of this.commands) {
			const slashCommand = command.toSlashCommand();

			if (!slashCommand) {
				continue;
			}

			slashCommands.push(slashCommand.toJSON());
		}

		return slashCommands;
	}
}
