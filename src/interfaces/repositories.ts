import User from '../entity/User';
import Button from '../entity/Button';
import Permission from '../entity/Permission';
import State from '../entity/State';

export interface RepositoriesMap {
	UserRepository: User;
	ButtonRepository: Button;
	PermissionRepository: Permission;
	StateRepository: State;
}
