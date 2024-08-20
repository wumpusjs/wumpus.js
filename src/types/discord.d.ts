import { DataSource } from 'typeorm';
import CommandManager from '../classes/CommandManager';
import MiddlewareManager from '../classes/MiddlewareManager';
import TempManager from '../classes/TempManager';
import ButtonManager from '../classes/ButtonManager';
export interface Client extends Client {
	command: CommandManager;
	temp: TempManager;
	middleware: MiddlewareManager;
	datasource: DataSource;
	repositories: Map<string, Repository<EntityInstanceType<R[number]>>>;
	buttons: ButtonManager;
}
declare module 'discord.js' {
	export interface Client extends Client {
		command: CommandManager;
		temp: TempManager;
		middleware: MiddlewareManager;
		datasource: DataSource;
		repositories: Map<string, Repository<EntityInstanceType<R[number]>>>;
		buttons: ButtonManager;
	}
}
