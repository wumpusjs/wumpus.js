import { Events } from 'discord.js';
import Middleware from '../classes/Middleware';
import { info } from '../utils/logger';

export default new Middleware(Events.MessageCreate, ([message], next) => {
	info('Middleware', 'MessageCreate', message.content);
	next();
});
