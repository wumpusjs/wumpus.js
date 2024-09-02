import User from '../entity/User';
import Button from '../entity/Button';
import Permission from '../entity/Permission';

export interface RepositoriesMap {
	UserRepository: User;
	ButtonRepository: Button;
	PermissionRepository: Permission;
}
