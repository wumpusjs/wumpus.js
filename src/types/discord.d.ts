import { DataSource, Repository } from 'typeorm';
import CommandManager from '../classes/CommandManager';
import MiddlewareManager from '../classes/MiddlewareManager';
import TempManager from '../classes/TempManager';
import ButtonManager from '../classes/ButtonManager';
import { RepositoriesMap } from '../interfaces/repositories';
export interface Client extends Client {
	command: CommandManager;
	temp: TempManager;
	middleware: MiddlewareManager;
	datasource: DataSource;
	repositories: Map<string, Repository<EntityInstanceType<R[number]>>>;
	repository: <T extends keyof RepositoriesMap>(
		name: T
	) => Repository<RepositoriesMap[T]>;
	buttons: ButtonManager;
}
declare module 'discord.js' {
	export interface Client extends Client {
		command: CommandManager;
		temp: TempManager;
		middleware: MiddlewareManager;
		datasource: DataSource;
		repositories: Map<string, Repository<EntityInstanceType<R[number]>>>;
		repository: <T extends keyof RepositoriesMap>(
			name: T
		) => Repository<RepositoriesMap[T]>;
		buttons: ButtonManager;
	}
}
