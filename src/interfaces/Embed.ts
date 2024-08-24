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