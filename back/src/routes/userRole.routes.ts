import { Router } from 'express';
import { UserRoleController } from '../controllers/userRole.controller';
import { requireRole } from '../middleware/authorization.middleware';
import { UserRole } from '../types/roles';

const router = Router();
const userRoleController = new UserRoleController();

// Toutes les routes de gestion des rôles sont réservées aux administrateurs
router.get('/', requireRole(UserRole.ADMIN), userRoleController.getAllUserRoles);
router.get('/:email', requireRole(UserRole.ADMIN), userRoleController.getUserRole);
router.post('/', requireRole(UserRole.ADMIN), userRoleController.setUserRole);
router.put('/:email/deactivate', requireRole(UserRole.ADMIN), userRoleController.deactivateUser);
router.put('/:email/activate', requireRole(UserRole.ADMIN), userRoleController.activateUser);

export default router;
