import { LocaleString } from "discord.js";
import { EmbedType } from "../utils/embed";

export interface EmbedOptions {
	type: EmbedType;
	color?: number;
}

export interface Field {
	name: string;
	value: string;
	inline: boolean;
}

export interface Footer {
	text: string;
	iconURL?: string;
}

export interface TemplateEmbedOptions {
	type: EmbedType;
	title: Partial<Record<LocaleString, string>>;
	description?: Partial<Record<LocaleString, string>>;
	fields?: Partial<Record<LocaleString, Field[]>>;
	color?: number;
	variables?: Record<string, string>;
}