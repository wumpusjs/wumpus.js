import 'reflect-metadata';

import { Client, GatewayIntentBits, Locale } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands, putCommands } from './utils/command';
import { loadEvents } from './utils/event';
import TempManager from './classes/TempManager';
import { loadMiddlewares } from './utils/middlewares';
import MiddlewareManager from './classes/MiddlewareManager';
import { parseENV } from './utils/env';
import Database from './classes/Database';
import ButtonManager from './classes/ButtonManager';
import WumpusStructure from './structures/wumpus';
import { Repository } from 'typeorm';
import { RepositoriesMap } from './interfaces/repositories';
import CommandManager from './classes/CommandManager';

dotenv.config();

class Wumpus implements WumpusStructure {
	instance: Client;
	temp: TempManager;
	repositories = new Map();
	middleware: MiddlewareManager;
	command: CommandManager<any, any, any>;
	buttons: ButtonManager;
	database: Database;

	constructor() {
		this.instance = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
		});
		this.database = new Database(this);
		this.temp = new TempManager();
		this.middleware = new MiddlewareManager(this);
		this.buttons = new ButtonManager(this, Locale.EnglishUS);
		this.command = new CommandManager(this, Locale.EnglishUS);
	}

	async init() {
		this.temp.load();

		parseENV();

		await new Database(this as any).initialize();
		await loadMiddlewares(this);
		await loadCommands(this);
		await loadEvents(this);

		await putCommands(this, this.command.getCommandsJSON());

		await this.buttons.initialize();
	}

	repository<T extends keyof RepositoriesMap>(
		name: T
	): Repository<RepositoriesMap[T]> {
		return this.repositories.get(name);
	}
}
