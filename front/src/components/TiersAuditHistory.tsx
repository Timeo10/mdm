import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Lock as LockIcon } from '@mui/icons-material';
import { TiersApi } from '../services/TiersApi';
import { TiersAuditLog, TiersAuditAction } from '../types';
import { SnackbarContext } from '../providers/SnackBarProvider';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../types/permissions';

interface TiersAuditHistoryProps {
  tiersUuid: string;
  refreshTrigger?: number;
}

const actionLabels: Record<TiersAuditAction, string> = {
  [TiersAuditAction.CREATE]: 'Création',
  [TiersAuditAction.UPDATE]: 'Mise à jour',
  [TiersAuditAction.DELETE]: 'Suppression',
  [TiersAuditAction.ATTACH_SOCIETE]: 'Attachement société',
  [TiersAuditAction.DETACH_SOCIETE]: 'Détachement société',
  [TiersAuditAction.UPDATE_TIERS_SOCIETE]: 'Modification relation société',
  [TiersAuditAction.UPDATE_CUSTOM_ATTRIBUTE]: 'Modification attribut personnalisé',
  [TiersAuditAction.UPDATE_GLOBAL_ATTRIBUTE]: 'Modification attribut global',
  [TiersAuditAction.ASSIGN_ROLE]: 'Attribution de rôle',
  [TiersAuditAction.REMOVE_ROLE]: 'Retrait de rôle',
  [TiersAuditAction.CREATE_CONTACT]: 'Création de contact',
  [TiersAuditAction.UPDATE_CONTACT]: 'Modification de contact',
  [TiersAuditAction.DELETE_CONTACT]: 'Suppression de contact',
};

const actionColors: Record<TiersAuditAction, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  [TiersAuditAction.CREATE]: 'success',
  [TiersAuditAction.UPDATE]: 'info',
  [TiersAuditAction.DELETE]: 'error',
  [TiersAuditAction.ATTACH_SOCIETE]: 'success',
  [TiersAuditAction.DETACH_SOCIETE]: 'warning',
  [TiersAuditAction.UPDATE_TIERS_SOCIETE]: 'info',
  [TiersAuditAction.UPDATE_CUSTOM_ATTRIBUTE]: 'info',
  [TiersAuditAction.UPDATE_GLOBAL_ATTRIBUTE]: 'info',
  [TiersAuditAction.ASSIGN_ROLE]: 'success',
  [TiersAuditAction.REMOVE_ROLE]: 'warning',
  [TiersAuditAction.CREATE_CONTACT]: 'success',
  [TiersAuditAction.UPDATE_CONTACT]: 'info',
  [TiersAuditAction.DELETE_CONTACT]: 'error',
};

export default function TiersAuditHistory({ tiersUuid, refreshTrigger }: TiersAuditHistoryProps) {
  const [logs, setLogs] = useState<TiersAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAction, setFilterAction] = useState<TiersAuditAction | ''>('');
  const snackBarProvider = useContext(SnackbarContext);
  const permissions = usePermissions();

  const loadAuditHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TiersApi.getAuditHistory(tiersUuid, {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        action: filterAction || undefined,
      });
      setLogs(response.logs);
      setTotal(response.total);
    } catch (error) {
      console.error('Erreur de chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  }, [tiersUuid, page, rowsPerPage, filterAction]);

  useEffect(() => {
    loadAuditHistory();
  }, [loadAuditHistory, refreshTrigger]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderChanges = (log: TiersAuditLog) => {
    if (!log.changes || Object.keys(log.changes).length === 0) {
      return <Typography variant="body2" color="text.secondary">Aucun détail disponible</Typography>;
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Champ</TableCell>
            <TableCell>Ancienne valeur</TableCell>
            <TableCell>Nouvelle valeur</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(log.changes).map(([field, change]: [string, any]) => (
            <TableRow key={field}>
              <TableCell><strong>{field}</strong></TableCell>
              <TableCell>
                <code>{change.old !== undefined ? String(JSON.stringify(change.old)) : '-'}</code>
              </TableCell>
              <TableCell>
                <code>{change.new !== undefined ? String(JSON.stringify(change.new)) : '-'}</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Vérifier la permission d'accès à l'audit
  if (!permissions.can(Permission.AUDIT_READ)) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning" icon={<LockIcon />}>
            Vous n'avez pas la permission de consulter l'historique des modifications.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6"></Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Filtrer par action</InputLabel>
            <Select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value as TiersAuditAction | '');
                setPage(0);
              }}
              label="Filtrer par action"
            >
              <MenuItem value="">
                <em>Toutes les actions</em>
              </MenuItem>
              {Object.entries(actionLabels).map(([action, label]) => (
                <MenuItem key={action} value={action}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {logs.length === 0 ? (
          <Typography color="text.secondary">Aucun historique disponible</Typography>
        ) : (
          <>
            {logs.map((log) => (
              <Accordion key={log.uuid}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%" gap={2}>
                    <Chip
                      label={actionLabels[log.action]}
                      color={actionColors[log.action]}
                      size="small"
                    />
                    <Typography sx={{ flexGrow: 1 }}>
                      {log.description || actionLabels[log.action]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(log.dateAction)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Informations
                      </Typography>
                      <Typography variant="body2">
                        <strong>Utilisateur:</strong> {log.userName || log.userEmail || 'Système'}
                      </Typography>
                      {log.ipAddress && (
                        <Typography variant="body2">
                          <strong>Adresse IP:</strong> {log.ipAddress}
                        </Typography>
                      )}
                      {log.entityType && (
                        <Typography variant="body2">
                          <strong>Type d'entité:</strong> {log.entityType}
                        </Typography>
                      )}
                    </Box>

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Détails des modifications
                        </Typography>
                        {renderChanges(log)}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
