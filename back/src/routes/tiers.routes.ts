import { Router } from 'express';
import { TiersController } from '../controllers/tiers.controller';
import { TiersContactController } from '../controllers/tiersContact.controller';
import { requirePermission } from '../middleware/authorization.middleware';
import { Permission } from '../types/roles';

const router = Router();
const tiersController = new TiersController();
const tiersContactController = new TiersContactController();

// Routes de lecture - Permission TIERS_READ
router.get('/', requirePermission(Permission.TIERS_READ), tiersController.findAll);
router.get('/search/similar', requirePermission(Permission.TIERS_READ), tiersController.searchSimilar);
router.get('/:uuid', requirePermission(Permission.TIERS_READ), tiersController.findById);
router.get('/:uuid/societes', requirePermission(Permission.TIERS_READ), tiersController.findWithSocietes);

// Routes d'audit - Permission AUDIT_READ
router.get('/:uuid/audit', requirePermission(Permission.AUDIT_READ), tiersController.getAuditHistory);

// Routes d'écriture - Permissions spécifiques
router.post('/', requirePermission(Permission.TIERS_CREATE), tiersController.create);
router.put('/:uuid', requirePermission(Permission.TIERS_UPDATE), tiersController.update);
router.delete('/:uuid', requirePermission(Permission.TIERS_DELETE), tiersController.delete);

// Routes de gestion des relations Tiers-Société
router.post('/societes', requirePermission(Permission.TIERS_SOCIETE_ATTACH), tiersController.attachToSociete);
router.put('/societes/:tierSocieteUuid', requirePermission(Permission.TIERS_SOCIETE_UPDATE), tiersController.updateTiersSociete);
router.delete('/societes/:tierSocieteUuid', requirePermission(Permission.TIERS_SOCIETE_DETACH), tiersController.detachFromSociete);
router.put('/societes/:tierSocieteUuid/attributes/:attributeUuid', requirePermission(Permission.CUSTOM_ATTRIBUTE_UPDATE), tiersController.updateCustomAttribute);

// Routes de gestion des contacts
router.get('/:uuid/contacts', requirePermission(Permission.TIERS_READ), tiersContactController.findByTiers);
router.post('/:uuid/contacts', requirePermission(Permission.TIERS_UPDATE), tiersContactController.create);
router.put('/contacts/:contactUuid', requirePermission(Permission.TIERS_UPDATE), tiersContactController.update);
router.delete('/contacts/:contactUuid', requirePermission(Permission.TIERS_UPDATE), tiersContactController.delete);

export default router;
