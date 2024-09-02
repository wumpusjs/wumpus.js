import PERMISSION from '../constants/permission';
import Wumpus from '../structures/wumpus';
import { warn } from './logger';

export async function checkPermission(
	client: Wumpus,
	id: string,
	permission: PERMISSION
) {
	if (client.superusers.includes(id)) {
		return true;
	}

	const Permission = client.repository('PermissionRepository');

	if (!Permission) {
		warn('Permission repository not found');
		return false;
	}

	const permissionData = await Permission.findOne({
		where: {
			userID: id,
			permission: permission,
		},
	});

	return !!permissionData;
}
