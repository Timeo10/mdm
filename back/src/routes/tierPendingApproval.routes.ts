import { Router } from 'express';
import { TierPendingApprovalController } from '../controllers/tierPendingApproval.controller';
import { requirePermission } from '../middleware/authorization.middleware';
import { Permission } from '../types/roles';

const router = Router();
const controller = new TierPendingApprovalController();

// Routes de lecture - Permission APPROVAL_READ
router.get('/', requirePermission(Permission.APPROVAL_READ), controller.findAll);
router.get('/statistics', requirePermission(Permission.APPROVAL_READ), controller.getStatistics);
router.get('/:uuid', requirePermission(Permission.APPROVAL_READ), controller.findById);

// Routes d'écriture - Permission TIERS_CREATE pour soumettre
router.post('/', requirePermission(Permission.TIERS_CREATE), controller.submit);
router.post('/bulk', requirePermission(Permission.TIERS_CREATE), controller.bulkSubmit);

// Routes d'approbation - Permissions APPROVAL_APPROVE et APPROVAL_REJECT
router.post('/:uuid/approve', requirePermission(Permission.APPROVAL_APPROVE), controller.approve);
router.post('/:uuid/reject', requirePermission(Permission.APPROVAL_REJECT), controller.reject);
router.delete('/:uuid', requirePermission(Permission.APPROVAL_REJECT), controller.delete);

export default router;
