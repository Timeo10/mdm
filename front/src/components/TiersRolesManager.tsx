import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import TiersRoleApi, { TiersRole, TiersSocieteRole } from '../services/TiersRoleApi';
import SocieteApi from '../services/SocieteApi';
import { useSnackbar } from '../providers/SnackBarProvider';
import { Societe } from '../types';

interface TiersRolesManagerProps {
  tiersUuid: string;
  isReadOnly : boolean;
  onRoleChange?: () => void;
}

const TiersRolesManager: React.FC<TiersRolesManagerProps> = ({ tiersUuid, isReadOnly, onRoleChange }) => {
  const [rolesData, setRolesData] = useState<
    Array<{
      societe: Societe;
      roles: Array<{ role: TiersRole; assignment: TiersSocieteRole }>;
    }>
  >([]);
  const [availableRoles, setAvailableRoles] = useState<TiersRole[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    assignment: { uuid: string; roleName: string; societeName: string } | null;
  }>({
    open: false,
    assignment: null,
  });
  const snackBarProvider = useSnackbar();

  const [assignmentForm, setAssignmentForm] = useState<{
    societe: Societe | null;
    roleUuid: string;
    commentaire: string;
    codeRoutageAdvEntrant: string;
  }>({
    societe: null,
    roleUuid: '',
    commentaire: '',
    codeRoutageAdvEntrant: '',
  });

  useEffect(() => {
    loadData();
  }, [tiersUuid]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, availableRolesResponse, societesResponse] = await Promise.all([
        TiersRoleApi.getTiersRoles(tiersUuid),
        TiersRoleApi.getAllRoles(false),
        SocieteApi.getAll(),
      ]);
      setRolesData(rolesResponse);
      setAvailableRoles(availableRolesResponse);
      setSocietes(societesResponse);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = () => {
    setAssignmentForm({
      societe: null,
      roleUuid: '',
      commentaire: '',
      codeRoutageAdvEntrant: '',
    });
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const handleAssignRole = async () => {
    if (!assignmentForm.societe) {
      snackBarProvider?.showSnackbarMessage('Veuillez sélectionner une société', 'error');
      return;
    }

    try {
      await TiersRoleApi.assignRoleToTier({
        tiersUuid,
        societeUuid: assignmentForm.societe.uuid,
        roleUuid: assignmentForm.roleUuid,
        commentaire: assignmentForm.commentaire || undefined,
        codeRoutageAdvEntrant: assignmentForm.codeRoutageAdvEntrant || undefined,
      });
      snackBarProvider?.showSnackbarMessage('Rôle assigné avec succès', 'success');
      handleCloseDrawer();
      loadData();
      onRoleChange?.();
    } catch (error: any) {
      console.error('Erreur lors de l\'assignation:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'assignation';
      snackBarProvider?.showSnackbarMessage(errorMessage, 'error');
    }
  };

  const handleOpenDeleteDialog = (
    assignmentUuid: string,
    roleName: string,
    societeName: string
  ) => {
    setDeleteDialog({
      open: true,
      assignment: { uuid: assignmentUuid, roleName, societeName },
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      assignment: null,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.assignment) return;

    try {
      await TiersRoleApi.deleteTiersSocieteRole(deleteDialog.assignment.uuid);
      snackBarProvider?.showSnackbarMessage('Rôle retiré avec succès', 'success');
      handleCloseDeleteDialog();
      loadData();
      onRoleChange?.();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {!isReadOnly && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenDrawer}
          >
            Assigner un rôle
          </Button>
        )}
      </Box>
      <Box>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : rolesData.length === 0 ? (
          <Typography color="text.secondary">
            Aucun rôle assigné. Cliquez sur "Assigner un rôle" pour commencer.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {rolesData.map((societeData) => (
              <Box key={societeData.societe.uuid}>
                <Typography variant="h6" gutterBottom>
                  {societeData.societe.raisonSociale}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rôle</TableCell>
                        <TableCell>Commentaire</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {societeData.roles.map(({ role, assignment }) => (
                        <TableRow key={assignment.uuid}>
                          <TableCell>
                            <Chip
                              label={role.libelle}
                              size="small"
                              sx={{
                                backgroundColor: role.couleur,
                                color: '#fff',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {assignment.commentaire || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {!isReadOnly && (
                            <Tooltip title="Retirer le rôle">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleOpenDeleteDialog(
                                    assignment.uuid,
                                    role.libelle,
                                    societeData.societe.raisonSociale
                                  )
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Drawer d'assignation */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Assigner un rôle</Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Autocomplete
              options={societes}
              getOptionLabel={(option) => option.raisonSociale}
              value={assignmentForm.societe}
              onChange={(_, newValue) =>
                setAssignmentForm({ ...assignmentForm, societe: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Société"
                  required
                  placeholder="Rechercher une société..."
                />
              )}
              noOptionsText="Aucune société trouvée"
            />

            <FormControl fullWidth required>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={assignmentForm.roleUuid}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, roleUuid: e.target.value })
                }
                label="Rôle"
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.uuid} value={role.uuid}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: role.couleur,
                        }}
                      />
                      <span>{role.libelle}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              freeSolo
              options={[]}
              value={assignmentForm.codeRoutageAdvEntrant}
              onInputChange={(_, newValue) =>
                setAssignmentForm({ ...assignmentForm, codeRoutageAdvEntrant: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Code routage ADV entrant (optionnel)"
                  placeholder="Saisir un code..."
                />
              )}
              noOptionsText="Aucune suggestion"
            />

            <TextField
              label="Commentaire (optionnel)"
              value={assignmentForm.commentaire}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, commentaire: e.target.value })
              }
              multiline
              rows={4}
              fullWidth
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCloseDrawer} variant="outlined">
              Annuler
            </Button>
            <Button
              onClick={handleAssignRole}
              variant="contained"
              disabled={!assignmentForm.societe || !assignmentForm.roleUuid}
            >
              Assigner
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir retirer le rôle{' '}
            <strong>{deleteDialog.assignment?.roleName}</strong> pour la société{' '}
            <strong>{deleteDialog.assignment?.societeName}</strong> ?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: 'text.secondary' }}>
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Retirer le rôle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TiersRolesManager;
