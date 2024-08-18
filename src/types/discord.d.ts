import { DataSource } from "typeorm";
import CommandManager from "../classes/CommandManager";
import MiddlewareManager from "../classes/MiddlewareManager";
import TempManager from "../classes/TempManager";

declare module "discord.js" {
	export interface Client extends Client {
		command: CommandManager;
		temp: TempManager;
		middleware: MiddlewareManager;
		datasource: DataSource;
	}
}

export {};