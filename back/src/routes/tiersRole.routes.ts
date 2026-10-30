import { Router, Request, Response } from 'express';
import { TiersRoleService } from '../services/tiersRole.service';
import { TiersSocieteRoleService } from '../services/tiersSocieteRole.service';
import { TiersAuditService } from '../services/tiersAudit.service';
import { requirePermission } from '../middleware/authorization.middleware';
import { Permission } from '../types/roles';

const router = Router();
const tiersRoleService = new TiersRoleService();
const tiersSocieteRoleService = new TiersSocieteRoleService();
const auditService = new TiersAuditService();

// ========================================
// CRUD des rôles (administration)
// ========================================

// Récupérer tous les rôles
router.get('/roles', requirePermission(Permission.ROLE_READ), async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const roles = await tiersRoleService.findAll(includeInactive);
    res.json(roles);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Récupérer un rôle par UUID
router.get('/roles/:uuid', requirePermission(Permission.ROLE_READ), async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    if (!uuid) {
      return res.status(400).json({ message: 'UUID manquant' });
    }
    const role = await tiersRoleService.findById(uuid);
    if (!role) {
      return res.status(404).json({ message: 'Rôle introuvable' });
    }
    res.json(role);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Créer un nouveau rôle
router.post('/roles', requirePermission(Permission.ROLE_CREATE), async (req: Request, res: Response) => {
  try {
    const role = await tiersRoleService.create(req.body);
    res.status(201).json(role);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Mettre à jour un rôle
router.put('/roles/:uuid', requirePermission(Permission.ROLE_UPDATE), async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    if (!uuid) {
      return res.status(400).json({ message: 'UUID manquant' });
    }
    const role = await tiersRoleService.update(uuid, req.body);
    res.json(role);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Supprimer un rôle
router.delete('/roles/:uuid', requirePermission(Permission.ROLE_DELETE), async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    if (!uuid) {
      return res.status(400).json({ message: 'UUID manquant' });
    }
    await tiersRoleService.delete(uuid);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Réorganiser les rôles
router.post('/roles/reorder', requirePermission(Permission.ROLE_UPDATE), async (req: Request, res: Response) => {
  try {
    const { orderedUuids } = req.body;
    await tiersRoleService.reorder(orderedUuids);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// ========================================
// Gestion des rôles assignés aux tiers
// ========================================

// Récupérer tous les rôles d'un tiers (groupés par société)
router.get('/tiers/:tiersUuid/roles', requirePermission(Permission.TIERS_READ), async (req: Request, res: Response) => {
  try {
    const { tiersUuid } = req.params;
    if (!tiersUuid) {
      return res.status(400).json({ message: 'UUID du tiers manquant' });
    }
    const roles = await tiersSocieteRoleService.getRolesByTierGroupedBySociete(tiersUuid);
    res.json(roles);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Récupérer les rôles d'un tiers pour une société spécifique
router.get('/tiers/:tiersUuid/societes/:societeUuid/roles', requirePermission(Permission.TIERS_READ), async (req: Request, res: Response) => {
  try {
    const { tiersUuid, societeUuid } = req.params;
    if (!tiersUuid || !societeUuid) {
      return res.status(400).json({ message: 'UUID du tiers et de la société requis' });
    }
    const roles = await tiersSocieteRoleService.findByTierAndSociete(tiersUuid, societeUuid);
    res.json(roles);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Assigner un rôle à un tiers pour une société
router.post('/tiers/roles', requirePermission(Permission.TIERS_SOCIETE_UPDATE), async (req: Request, res: Response) => {
  try {
    const auditContext = auditService.extractContextFromRequest(req);
    const assignment = await tiersSocieteRoleService.assignRole(req.body, auditContext);
    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Assigner plusieurs rôles en une fois
router.post('/tiers/roles/bulk', requirePermission(Permission.TIERS_SOCIETE_UPDATE), async (req: Request, res: Response) => {
  try {
    const result = await tiersSocieteRoleService.bulkAssignRoles(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Mettre à jour une assignation de rôle
router.put('/tiers/roles/:uuid', requirePermission(Permission.TIERS_SOCIETE_UPDATE), async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    if (!uuid) {
      return res.status(400).json({ message: 'UUID manquant' });
    }
    const assignment = await tiersSocieteRoleService.update(uuid, req.body);
    res.json(assignment);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Supprimer une assignation de rôle
router.delete('/tiers/roles/:uuid', requirePermission(Permission.TIERS_SOCIETE_UPDATE), async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    if (!uuid) {
      return res.status(400).json({ message: 'UUID manquant' });
    }
    const auditContext = auditService.extractContextFromRequest(req);
    await tiersSocieteRoleService.delete(uuid, auditContext);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Récupérer tous les tiers d'une société avec leurs rôles
router.get('/societes/:societeUuid/tiers-roles', requirePermission(Permission.SOCIETE_READ), async (req: Request, res: Response) => {
  try {
    const { societeUuid } = req.params;
    if (!societeUuid) {
      return res.status(400).json({ message: 'UUID de la société manquant' });
    }
    const roles = await tiersSocieteRoleService.findBySociete(societeUuid);
    res.json(roles);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

export default router;
