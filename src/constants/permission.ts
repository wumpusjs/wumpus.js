enum PERMISSION {
	// This permission is automatically granted to specific users.
	// If this app is assigned to a user account rather than a team, it will only be assigned to the bot owner.
	// If this app is assigned to a team, it will be assigned to all team members.
	// THIS IS A DANGEROUS PERMISSION FOR ASSIGNING TO USERS. USE WITH CAUTION.
	SUPERUSER = 'superuser',

	// These permissions are granted manually.
	// Each permission can be granted by a user with a higher permission level.
	Administrator = 'administrator',
	Moderator = 'moderator',
}

export default PERMISSION;
