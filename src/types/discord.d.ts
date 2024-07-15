import CommandManager from "../classes/CommandManager";

declare module "discord.js" {
	export interface Client extends Client {
		command: CommandManager;
	}
}

export {};