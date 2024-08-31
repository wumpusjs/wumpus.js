import { EmbedBuilder, LocaleString, User } from 'discord.js';
import {
	EmbedOptions,
	Field,
	Footer,
	TemplateEmbedOptions,
} from '../interfaces/Embed';

export enum EmbedType {
	Success,
	Error,
	Warning,
	Info,
	Normal,
}

export const EmbedColors = {
	[EmbedType.Success]: 0x4ade80,
	[EmbedType.Error]: 0xf43f5e,
	[EmbedType.Warning]: 0xfbbf24,
	[EmbedType.Info]: 0x818cf8,
	[EmbedType.Normal]: 0x6b7280,
};

export default class Embed {
	type: EmbedType;
	color: number;
	title?: string;
	content?: {
		text: string;
		fields: Field[];
	};
	footer?: Footer;

	constructor(options: EmbedOptions) {
		this.type = options.type;
		this.color =
			'color' in options ? options.color! : EmbedColors[options.type];
	}

	setTitle(title: string) {
		this.title = title;
		return this;
	}

	setText(text: string) {
		this.content = { text, fields: this.content?.fields ?? [] };
		return this;
	}

	setFields(fields: Field[]) {
		this.content = { text: this.content?.text ?? '', fields };
		return this;
	}

	addField(
		name: Field['name'],
		value: Field['value'],
		inline: Field['inline'] = false
	) {
		this.content = {
			text: this.content?.text ?? '',
			fields: [...(this.content?.fields ?? []), { name, value, inline }],
		};
		return this;
	}

	setFooter(text: Footer['text'], iconURL: Footer['iconURL']) {
		this.footer = { text, iconURL };
		return this;
	}

	toEmbed() {
		return new EmbedBuilder({
			title: this.title,
			description: this.content?.text,
			fields: this.content?.fields,
			color: this.color,
			footer: this.footer,
		});
	}
}

export class EmbedTemplate {
	title: Partial<Record<LocaleString, string>>;
	description?: Partial<Record<LocaleString, string>>;
	fields?: Partial<Record<LocaleString, Field[]>>;
	color: number;
	variables?: Record<string, string>;

	constructor(options: TemplateEmbedOptions) {
		this.title = options.title ?? {};
		this.description = options.description ?? {};
		this.fields = options.fields ?? {};
		this.color =
			'color' in options ? options.color! : EmbedColors[options.type];
		this.variables = options.variables ?? {};
	}

	toEmbed(user: User, locale: LocaleString, variables?: Record<string, string>) {
		const title = this.title[locale] ?? this.title['en-US'];
		const description =
			this.description?.[locale] ?? this.description?.['en-US'];
		const fields = this.fields?.[locale] ?? this.fields?.['en-US'] ?? [];

		const replace = (text: string) => {
			for (const [key, value] of Object.entries(variables ?? {})) {
				text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
			}
			return text;
		}

		const embed = new Embed({ type: this.color });
		if (title) embed.setTitle(replace(title));
		if (description) embed.setText(replace(description));

		if (fields) {
			for (const field of fields) {
				embed.addField(replace(field.name), replace(field.value), field.inline);
			}
		}

		embed.setFooter(
			user.username,
			user.avatarURL({ size: 64 }) || user.defaultAvatarURL
		);

		return embed.toEmbed();
	}
}
