import {
	ButtonInteraction,
	Channel,
	GuildMember,
	Locale,
	Role,
	User,
} from 'discord.js';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';
import { ButtonStyle } from '../utils/button';
import Wumpus from '../structures/wumpus';

export type OptionTypes =
	| 'BOOLEAN'
	| 'CHANNEL'
	| 'INTEGER'
	| 'MEMBER'
	| 'NUMBER'
	| 'ROLE'
	| 'STRING'
	| 'USER';

type OptionTypeMap = {
	BOOLEAN: boolean;
	CHANNEL: Channel;
	INTEGER: number;
	MEMBER: GuildMember;
	NUMBER: number;
	ROLE: Role;
	STRING: string;
	USER: User;
};

type ExtractOptionNames<T extends ButtonField[]> = T[number]['name'];

export type DynamicRequirements<
	Required extends Boolean,
	Type
> = Required extends true ? Type : Type | undefined;

export type InferOptions<T extends ButtonField[]> = {
	[K in ExtractOptionNames<T>]: DynamicRequirements<
		Extract<T[number], { name: K }>['required'] extends true ? true : false,
		OptionTypeMap[Extract<T[number], { name: K }>['type']]
	>;
};

export interface ButtonField<
	T extends OptionTypes = OptionTypes,
	R extends boolean = false
> {
	type: T;
	name: string;
	required?: R;
}

export type SpecificButtonField<T extends OptionTypes> = Omit<
	Extract<ButtonField, { type: T }>,
	'type' | 'name' | 'required'
> & {
	[K: string]: any;
};

export interface ButtonOptions<
	T extends ButtonField[],
	R extends EntityClassOrSchema[]
> {
	identifier: string;
	labels: { [key in Locale]?: string };
	fields?: T;
	repositories?: R;
	style?: ButtonStyle;
	emoji?: string;
	execute: ButtonExecutor<
		InferOptions<T>,
		Repository<EntityInstanceType<R[number]>>[]
	>;
}

export type ButtonExecutor<
	T = {},
	R extends Repository<EntityInstanceType<EntityClassOrSchema>>[] = []
> = (
	interaction: ButtonInteraction,
	options: T,
	client: Wumpus,
	...repositories: R
) => Promise<any>;

export type { OptionTypeMap };
