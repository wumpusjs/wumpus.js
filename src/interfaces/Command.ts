import {
	ChatInputCommandInteraction,
	Locale,
	SlashCommandStringOption,
	SlashCommandRoleOption,
	SlashCommandUserOption,
	SlashCommandNumberOption,
	SlashCommandBooleanOption,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandAttachmentOption,
	SlashCommandMentionableOption,
	User,
	Role,
	GuildMember,
	Channel,
	Attachment,
	Client,
} from 'discord.js';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';
import PERMISSION from '../constants/permission';
import Wumpus from '../structures/wumpus';

export type OptionTypes =
	| 'ATTACHMENT'
	| 'BOOLEAN'
	| 'CHANNEL'
	| 'INTEGER'
	| 'MEMBER'
	| 'MENTIONABLE'
	| 'NUMBER'
	| 'ROLE'
	| 'STRING'
	| 'USER';

type OptionTypeMap = {
	ATTACHMENT: Attachment;
	BOOLEAN: boolean;
	CHANNEL: Channel;
	INTEGER: number;
	MEMBER: GuildMember;
	MENTIONABLE: string;
	NUMBER: number;
	ROLE: Role;
	STRING: string;
	USER: User;
};

type ExtractOptionNames<T extends CommandOption[], L extends Locale> = {
	[K in keyof T]: T[K] extends { name: infer N }
		? L extends keyof N
			? N[L]
			: never
		: never;
}[number];

type DynamicRequirmenets<Required extends Boolean, Type> = Required extends true
	? Type
	: Type | undefined;

type InferOptions<T extends CommandOption[], L extends Locale> = {
	[K in ExtractOptionNames<T, L> extends string
		? ExtractOptionNames<T, L>
		: never]: DynamicRequirmenets<
		T extends { name: { [key in L]?: K }; required: true }[] ? true : false,
		OptionTypeMap[T[number]['type']]
	>;
};

export interface GlobalCommandOptions {
	type: OptionTypes;
	name: { [key in Locale]?: string };
	description: { [key in Locale]?: string };
	required?: boolean;
}

type CommandOption = GlobalCommandOptions &
	(
		| {
				type: 'STRING';
				minLength?: number;
				maxLength?: number /* add autocomplete */;
		  }
		| { type: 'BOOLEAN' }
		| { type: 'CHANNEL'; channel_types?: any[] }
		| {
				type: 'INTEGER';
				min_value?: number;
				max_value?: number /* add autocomplete */;
		  }
		| {
				type: 'NUMBER';
				min_value?: number;
				max_value?: number /* add autocomplete */;
		  }
		| { type: 'ROLE' /* type: 8 */ }
		| { type: 'USER' }
		| { type: 'ATTACHMENT' /* type: 8 */ }
		| { type: 'MENTIONABLE' /* type: 8 */ }
	);

export type SpecificCommandOption<T extends OptionTypes> = Omit<
	Extract<CommandOption, { type: T }>,
	'type' | 'name' | 'description' | 'required'
> & {
	[K: string]: any;
};

export type OptionBuilder<T extends OptionTypes> = T extends 'STRING'
	? SlashCommandStringOption
	: T extends 'BOOLEAN'
	? SlashCommandBooleanOption
	: T extends 'CHANNEL'
	? SlashCommandChannelOption
	: T extends 'INTEGER'
	? SlashCommandIntegerOption
	: T extends 'NUMBER'
	? SlashCommandNumberOption
	: T extends 'ROLE'
	? SlashCommandRoleOption
	: T extends 'USER'
	? SlashCommandUserOption
	: T extends 'ATTACHMENT'
	? SlashCommandAttachmentOption
	: T extends 'MENTIONABLE'
	? SlashCommandMentionableOption
	: never;

interface CommandOptions<
	T extends CommandOption[],
	L extends Locale,
	R extends EntityClassOrSchema[]
> {
	name: { [key in Locale]?: string };
	description: { [key in Locale]?: string };
	options?: T;
	defaultLocale?: L;
	timeout?: number;
	repositories?: R;
	execute: CommandExecutor<
		InferOptions<T, L>,
		Repository<EntityInstanceType<R[number]>>[]
	>;
	permission?: PERMISSION;
}

type CommandExecutor<
	T = {},
	R extends Repository<EntityInstanceType<EntityClassOrSchema>>[] = []
> = (
	interaction: ChatInputCommandInteraction & {
		client: Client;
	},
	options: T,
	client: Wumpus,
	...repositories: R
) => Promise<any>;

export type {
	CommandExecutor,
	CommandOptions,
	CommandOption,
	InferOptions,
	OptionTypeMap,
};
