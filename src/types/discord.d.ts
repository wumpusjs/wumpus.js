import CommandManager from "../classes/CommandManager";
import TempManager from "../classes/TempManager";

declare module "discord.js" {
	export interface Client extends Client {
		command: CommandManager;
		temp: TempManager;
	}
}

export {};