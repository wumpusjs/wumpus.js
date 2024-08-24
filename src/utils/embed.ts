import { EmbedBuilder } from 'discord.js';
import { EmbedOptions, Field, Footer } from '../interfaces/Embed';

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
