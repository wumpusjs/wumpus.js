import 'reflect-metadata';

import { Client, GatewayIntentBits, Locale, Team } from 'discord.js';
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
import { warn } from './utils/logger';

dotenv.config();

class Wumpus implements WumpusStructure {
	instance: Client;
	temp: TempManager;
	middleware: MiddlewareManager;
	command: CommandManager<any, any, any>;
	buttons: ButtonManager;
	database: Database;
	superusers: string[] = [];

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
		await this.temp.load();

		parseENV();

		await this.database.initialize();
		await loadMiddlewares(this);
		await loadCommands(this);
		await loadEvents(this);

		await putCommands(this, this.command.getCommandsJSON());

		await this.buttons.initialize();
	}

	async start() {
		await this.instance.login(process.env.TOKEN);

		await this.getOwner();
	}

	async getOwner() {
		await this.instance.application?.fetch();

		if (!this.instance.application?.owner) return warn('No owner found');

		if (this.instance.application.owner instanceof Team) {
			const team = this.instance.application.owner;
			if (team.owner) this.superusers.push(team.owner.id);

			team.members.each((member) => {
				this.superusers.push(member.id);
			});
		} else {
			this.superusers.push(this.instance.application.owner.id);
		}
	}

	repository<T extends keyof RepositoriesMap>(
		name: T
	): Repository<RepositoriesMap[T]> {
		return this.database.repositories.get(name)!;
	}
}

async function main() {
	const wumpus = new Wumpus();

	await wumpus.init();
	await wumpus.start();
}

main();
