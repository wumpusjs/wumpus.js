import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';
import axios from 'axios';
import type Wumpus from '../structures/wumpus';

const PACKAGE_JSON_PATH = path.resolve(__dirname, '../../package.json');
const REMOTE_PACKAGE_JSON_URL =
	'https://raw.githubusercontent.com/wraith4081/wumpus/main/package.json';

async function getVersion(
	source: 'local' | 'remote',
	client: Wumpus
): Promise<string | null> {
	try {
		const data =
			source === 'local'
				? await fs.readFile(PACKAGE_JSON_PATH, 'utf-8')
				: (await axios.get(REMOTE_PACKAGE_JSON_URL)).data;

		const version = JSON.parse(data)?.version;

		if (!semver.valid(version)) {
			client.logger.fatal(`Invalid version in ${source} package.json`);
			return null;
		}

		return version;
	} catch (e) {
		client.logger.fatal(
			`Failed to ${
				source === 'local' ? 'read' : 'fetch'
			} ${source} package.json`
		);
		return null;
	}
}

function logUpdateInfo(
	client: Wumpus,
	localVersion: string,
	remoteVersion: string
): void {
	const remote = semver.parse(remoteVersion);
	const local = semver.parse(localVersion);
	const diff = semver.diff(remoteVersion, localVersion);
	const message = `Update "${remoteVersion}" available! (${localVersion}->${remoteVersion})`;

	if (!remote || !local) {
		client.logger.fatal('Invalid remote or local version');
		process.exit(1);
	}

	if (remote.major > local.major) {
		client.logger.fatal(message);
		process.exit(1);
	}

	switch (diff) {
		case 'major':
		case 'premajor':
			client.logger.fatal(message);
			process.exit(1);
		case 'minor':
		case 'preminor':
			client.logger.warn(message);
			break;
		case 'patch':
		case 'prepatch':
		case 'prerelease':
			client.logger.info(message);
			break;
		default:
			client.logger.fatal('Unknown diff type');
	}
}

export async function checkForUpdate(client: Wumpus): Promise<void> {
	const [localVersion, remoteVersion] = await Promise.all([
		getVersion('local', client),
		getVersion('remote', client),
	]);

	if (!localVersion || !remoteVersion) {
		client.logger.fatal('Failed to check for updates');
		process.exit(1);
	}

	if (semver.gt(remoteVersion, localVersion)) {
		logUpdateInfo(client, localVersion, remoteVersion);
	} else {
		client.logger.info('No updates available');
	}
}
