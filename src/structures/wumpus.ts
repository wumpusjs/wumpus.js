import { Repository } from 'typeorm';
import TempManager from '../classes/TempManager';
import { RepositoriesMap } from '../interfaces/repositories';
import MiddlewareManager from '../classes/MiddlewareManager';
import { Client } from 'discord.js';
import CommandManager from '../classes/CommandManager';
import ButtonManager from '../classes/ButtonManager';
import Database from '../classes/Database';
import { Logger } from 'pino';
import Stator from '../classes/Stator';
import SelectManager from '../classes/SelectManager';

export default interface Wumpus {
	instance: Client;
	temp: TempManager;
	database: Database;
	repository: <T extends keyof RepositoriesMap>(
		name: T
	) => Repository<RepositoriesMap[T]> | undefined;
	middleware: MiddlewareManager;
	command: CommandManager<any, any, any>;
	buttons: ButtonManager;
	selects: SelectManager;
	superusers: string[];
	stator: Stator;

	logger: Logger;
}
