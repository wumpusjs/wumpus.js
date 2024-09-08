import { ComponentType, Locale, SelectMenuType, ChannelType, Channel, GuildMember, Role, User } from 'discord.js';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';

type Promised<T> = T | Promise<T>;

export type OptionTypes =
	| 'BOOLEAN'
	| 'CHANNEL'
	| 'INTEGER'
	| 'MEMBER'
	| 'NUMBER'
	| 'ROLE'
	| 'STRING'
	| 'USER';

type SelectOptionTypeMap = {
	BOOLEAN: boolean;
	CHANNEL: Channel;
	INTEGER: number;
	MEMBER: GuildMember;
	NUMBER: number;
	ROLE: Role;
	STRING: string;
	USER: User;
};

export interface SelectField<
    T extends OptionTypes,
    R extends boolean = false
> {
    type: T;
    name: string;
    required?: R;
}

type TypeToInteractionType<T extends SelectMenuType> = {
    [ComponentType.StringSelect]: import('discord.js').StringSelectMenuInteraction;
    [ComponentType.ChannelSelect]: import('discord.js').ChannelSelectMenuInteraction;
    [ComponentType.MentionableSelect]: import('discord.js').MentionableSelectMenuInteraction;
    [ComponentType.RoleSelect]: import('discord.js').RoleSelectMenuInteraction;
    [ComponentType.UserSelect]: import('discord.js').UserSelectMenuInteraction;
}[T];

export type OptionTypeMap = {
    [ComponentType.StringSelect]: string;
    [ComponentType.ChannelSelect]: string;
    [ComponentType.MentionableSelect]: string;
    [ComponentType.RoleSelect]: string;
    [ComponentType.UserSelect]: string;
};

type DynamicOptionFields<I extends SelectMenuType> = {
    [ComponentType.StringSelect]: {
        description?: string;
    };
    [ComponentType.ChannelSelect]: {
        channelTypes?: ChannelType[];
    };
    [ComponentType.MentionableSelect]: {};
    [ComponentType.RoleSelect]: {};
    [ComponentType.UserSelect]: {};
}[I];

export type OptionFactory<
    I extends SelectMenuType,
    R extends Repository<EntityInstanceType<EntityClassOrSchema>>[] = []
> = (client: import('../structures/wumpus').default, ...repositories: R) => Promised<(
    {
        default?: true;
        emoji?: string;
        label: string;
        value: OptionTypeMap[I];
    } & DynamicOptionFields<I>
)[]>;

type ExtractOptionNames<T extends SelectField<OptionTypes, boolean>[]> = T[number]['name'];

export type DynamicRequirements<
    Required extends boolean,
    Type
> = Required extends true ? Type : Type | undefined;

export type InferOptions<T extends SelectField<OptionTypes, boolean>[]> = {
    [K in ExtractOptionNames<T>]: DynamicRequirements<
        Extract<T[number], { name: K }>['required'] extends true ? true : false,
        SelectOptionTypeMap[Extract<T[number], { name: K }>['type']]
    >;
};

export type SelectExecutor<
    T = {},
    I extends SelectMenuType = ComponentType.StringSelect,
    R extends Repository<EntityInstanceType<EntityClassOrSchema>>[] = []
> = (
    interaction: TypeToInteractionType<I>,
    options: T,
    client: import('../structures/wumpus').default,
    ...repositories: R
) => Promise<any>;

export interface SelectOptions<
    I extends ComponentType.StringSelect /* SelectMenuType */,
    T extends SelectField<OptionTypes, boolean>[],
    R extends EntityClassOrSchema[]
> {
    identifier: string;
    placeholder: { [key in Locale]?: string };
    fields?: T;
    repositories?: R;
    options: OptionFactory<I, Repository<R[number]>[]>;
    execute: SelectExecutor<
        InferOptions<T>,
        I,
        Repository<EntityInstanceType<R[number]>>[]
    >;
    type: I;
}