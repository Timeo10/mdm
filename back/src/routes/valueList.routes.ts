import { Router } from 'express';
import { ValueListController } from '../controllers/valueList.controller';
import { requirePermission } from '../middleware/authorization.middleware';
import { Permission } from '../types/roles';

const router = Router();
const valueListController = new ValueListController();

// Routes de lecture - Permission CUSTOM_ATTRIBUTE_READ
router.get('/', requirePermission(Permission.CUSTOM_ATTRIBUTE_READ), valueListController.findAll);
router.get('/by-code/:code', requirePermission(Permission.CUSTOM_ATTRIBUTE_READ), valueListController.findByCode);
router.get('/:uuid', requirePermission(Permission.CUSTOM_ATTRIBUTE_READ), valueListController.findById);

// Routes d'écriture - Permissions CUSTOM_ATTRIBUTE (car les listes de valeurs sont utilisées par les attributs)
router.post('/', requirePermission(Permission.CUSTOM_ATTRIBUTE_CREATE), valueListController.create);
router.put('/:uuid', requirePermission(Permission.CUSTOM_ATTRIBUTE_UPDATE), valueListController.update);
router.delete('/:uuid', requirePermission(Permission.CUSTOM_ATTRIBUTE_DELETE), valueListController.delete);

export default router;
