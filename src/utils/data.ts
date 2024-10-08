import { BaseChannel, Client, GuildMember, Role, User } from 'discord.js';

export const packet = {
	STRING: (field: string) => field,
	BOOLEAN: (field: boolean) => field.toString(),
	CHANNEL: (field: BaseChannel) => field.id,
	INTEGER: (field: number) => field.toString(),
	NUMBER: (field: number) => field.toString(),
	ROLE: (field: Role) => field.id,
	USER: (field: User) => field.id,
	MEMBER: (field: GuildMember) => field.id,
} as {
	[key: string]: (field: any) => string;
};

export const resolve = (client?: Client, guildId?: string) => ({
	STRING: (field: string) => Promise.resolve(field),
	BOOLEAN: (field: string) => Promise.resolve(field === 'true'),
	CHANNEL: (field: string) => client?.channels.fetch?.(field),
	INTEGER: (field: string) => Promise.resolve(parseInt(field)),
	NUMBER: (field: string) => Promise.resolve(parseFloat(field)),
	ROLE: (field: string) =>
		client?.guilds.fetch?.(guildId!).then((g) => g.roles.fetch(field)),
	USER: (field: string) => client?.users.fetch(field),
	MEMBER: (field: string) =>
		client?.guilds.fetch(guildId!).then((g) => g.members.fetch(field)),
});

export const validate = {
	STRING: (field: unknown) => typeof field === 'string',
	BOOLEAN: (field: unknown) => !!field === field,
	CHANNEL: (field: unknown) => field instanceof BaseChannel,
	INTEGER: (field: number) => !isNaN(field) && field % 1 === 0,
	NUMBER: (field: number) => !isNaN(field),
	ROLE: (field: unknown) => field instanceof Role,
	USER: (field: unknown) => field instanceof User,
	MEMBER: (field: unknown) => field instanceof GuildMember,
} as {
	[key: string]: (field: any) => boolean;
};

export const identifyPacket = (packet: any): string => {
	return Object.keys(validate).find((key) => validate?.[key]?.(packet))!;
};
