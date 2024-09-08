import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';
import axios from 'axios';
import type Wumpus from '../structures/wumpus';

const PACKAGE_JSON_PATH = path.resolve(__dirname, '../../package.json');
const REMOTE_PACKAGE_JSON_URL =
	'https://raw.githubusercontent.com/wumpusjs/wumpus.js/main/package.json';

async function getVersion(
	source: 'local' | 'remote',
	client: Wumpus
): Promise<string | null> {
	try {
		let version: string;

		if (
			semver.valid(
				(version = (
					source === 'local'
						? JSON.parse(
								await fs.readFile(PACKAGE_JSON_PATH, 'utf-8')
						  )
						: (await axios.get(REMOTE_PACKAGE_JSON_URL))?.data
				)?.version)
			) === null
		) {
			client.logger.fatal(`Invalid version in ${source} package.json`);
			return null;
		}

		return version;
	} catch (e) {
		console.error(e);
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

	if (semver.lt(localVersion, '1.0.0')) {
		client.logger.warn(
			'This version is for initial development. Use with caution. And the current features may not be stable or can be removed/changed in the future.'
		);
	}

	if (semver.gt(localVersion, remoteVersion)) {
		client.logger.fatal(
			`Local version (${localVersion}) is greater than remote version (${remoteVersion})`
		);
		process.exit(1);
	}

	if (semver.gt(remoteVersion, localVersion)) {
		logUpdateInfo(client, localVersion, remoteVersion);
	} else {
		client.logger.info('No updates available');
	}
}
