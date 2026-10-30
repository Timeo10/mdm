import { Router } from 'express';
import { RibController } from '../controllers/rib.controller';
import { requirePermission } from '../middleware/authorization.middleware';
import { Permission } from '../types/roles';

const router = Router();
const ribController = new RibController();

// Routes de lecture - Permission SOCIETE_READ (car les RIB sont liés aux sociétés)
router.get('/', requirePermission(Permission.SOCIETE_READ), ribController.findAll);
router.get('/societe/:societeUuid', requirePermission(Permission.SOCIETE_READ), ribController.findBySociete);
router.get('/:uuid', requirePermission(Permission.SOCIETE_READ), ribController.findById);

// Routes d'écriture - Permission SOCIETE_UPDATE
router.post('/', requirePermission(Permission.SOCIETE_UPDATE), ribController.create);
router.put('/:uuid', requirePermission(Permission.SOCIETE_UPDATE), ribController.update);
router.delete('/:uuid', requirePermission(Permission.SOCIETE_DELETE), ribController.delete);

export default router;
