import { Router } from 'express';
import { CustomAttributeController } from '../controllers/customAttribute.controller';
import { requirePermission } from '../middleware/authorization.middleware';
import { Permission } from '../types/roles';

const router = Router();
const attributeController = new CustomAttributeController();

// Routes de lecture - Permission CUSTOM_ATTRIBUTE_READ
router.get('/', requirePermission(Permission.CUSTOM_ATTRIBUTE_READ), attributeController.findAll);
router.get('/:uuid', requirePermission(Permission.CUSTOM_ATTRIBUTE_READ), attributeController.findById);

// Routes d'écriture - Permissions spécifiques
router.post('/', requirePermission(Permission.CUSTOM_ATTRIBUTE_CREATE), attributeController.create);
router.put('/:uuid', requirePermission(Permission.CUSTOM_ATTRIBUTE_UPDATE), attributeController.update);
router.delete('/:uuid', requirePermission(Permission.CUSTOM_ATTRIBUTE_DELETE), attributeController.delete);

export default router;
