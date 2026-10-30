import { Router } from 'express';
import { SocieteController } from '../controllers/societe.controller';
import { requirePermission } from '../middleware/authorization.middleware';
import { Permission } from '../types/roles';

const router = Router();
const societeController = new SocieteController();

// Routes de lecture - Permission SOCIETE_READ
router.get('/', requirePermission(Permission.SOCIETE_READ), societeController.findAll);
router.get('/:uuid', requirePermission(Permission.SOCIETE_READ), societeController.findById);

// Routes d'écriture - Permissions spécifiques
router.post('/', requirePermission(Permission.SOCIETE_CREATE), societeController.create);
router.put('/:uuid', requirePermission(Permission.SOCIETE_UPDATE), societeController.update);
router.delete('/:uuid', requirePermission(Permission.SOCIETE_DELETE), societeController.delete);

export default router;
