import { ApplicationCommandOptionType, ChatInputCommandInteraction, Locale, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
import { error } from "../utils/logger";
import Command from "./Command";
import { OptionTypes } from "../interfaces/Command";

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

	async handleInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
		const command = this.commands.get(
			interaction.commandName.toLowerCase()
		);

		if (!command) {
			return;
		}

		const options: {
			[key: string]: any;
		} = {};

		const promises: Promise<void>[] = [];

		for (const option of interaction.options.data) {
			const handler = ({
				[ApplicationCommandOptionType.Attachment]: () => interaction.options.getAttachment(option.name),
				[ApplicationCommandOptionType.Boolean]: () => !!interaction.options.get(option.name)?.value,
				[ApplicationCommandOptionType.Channel]: () => interaction.guild?.channels.fetch(interaction.options.get(option.name)?.value as string),
				[ApplicationCommandOptionType.Integer]: () => ~~Number(interaction.options.get(option.name)?.value),
				[ApplicationCommandOptionType.Mentionable]: () => interaction.options.getMentionable(option.name),
				[ApplicationCommandOptionType.Number]: () => Number(interaction.options.get(option.name)?.value),
				[ApplicationCommandOptionType.Role]: () => interaction.guild?.roles.fetch(interaction.options.get(option.name)?.value as string),
				[ApplicationCommandOptionType.String]: () => String(interaction.options.get(option.name)?.value),
				[ApplicationCommandOptionType.User]: () => interaction.client.users.fetch(interaction.options.get(option.name)?.value as string),
			} as any)?.[option.type];

			if (!handler) {
				continue;
			}

			promises.push(
				Promise.resolve(handler()).then(value => {
					options[option.name] = value;
				})
			);
		}

		await Promise.all(promises);

		await command.execute(interaction, options as any);
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
