import { createHash, randomBytes } from 'crypto';

export const SHA256 = (data: string) =>
	createHash('sha256').update(data).digest('hex');

export const SHA1 = (data: string) =>
	createHash('sha1').update(data).digest('hex');

export const RANDOM_STRING = (length: number) =>
	randomBytes(length).toString('hex');
