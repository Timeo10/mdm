import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Drawer,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import TiersRoleApi, { TiersRole, CreateTiersRoleDto, UpdateTiersRoleDto } from '../../services/TiersRoleApi';
import { useSnackbar } from '../../providers/SnackBarProvider';

const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<TiersRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingRole, setEditingRole] = useState<TiersRole | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const snackBarProvider = useSnackbar();

  const [formData, setFormData] = useState<CreateTiersRoleDto>({
    code: '',
    libelle: '',
    description: '',
    couleur: '#2196F3',
    actif: true,
  });

  useEffect(() => {
    loadRoles();
  }, [includeInactive]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await TiersRoleApi.getAllRoles(includeInactive);
      setRoles(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des rôles:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors du chargement des rôles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (role?: TiersRole) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        code: role.code,
        libelle: role.libelle,
        description: role.description || '',
        couleur: role.couleur || '#2196F3',
        actif: role.actif,
      });
    } else {
      setEditingRole(null);
      setFormData({
        code: '',
        libelle: '',
        description: '',
        couleur: '#2196F3',
        actif: true,
      });
    }
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setEditingRole(null);
    setFormData({
      code: '',
      libelle: '',
      description: '',
      couleur: '#2196F3',
      actif: true,
    });
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        await TiersRoleApi.updateRole(editingRole.uuid, formData as UpdateTiersRoleDto);
        snackBarProvider?.showSnackbarMessage('Rôle modifié avec succès', 'success');
      } else {
        await TiersRoleApi.createRole(formData);
        snackBarProvider?.showSnackbarMessage('Rôle créé avec succès', 'success');
      }
      handleCloseDrawer();
      loadRoles();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      snackBarProvider?.showSnackbarMessage(errorMessage, 'error');
    }
  };

  const handleDelete = async (uuid: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return;
    }

    try {
      await TiersRoleApi.deleteRole(uuid);
      snackBarProvider?.showSnackbarMessage('Rôle supprimé avec succès', 'success');
      loadRoles();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
      snackBarProvider?.showSnackbarMessage(errorMessage, 'error');
    }
  };

  const handleToggleActive = async (role: TiersRole) => {
    try {
      await TiersRoleApi.updateRole(role.uuid, { actif: !role.actif });
      snackBarProvider?.showSnackbarMessage(
        `Rôle ${!role.actif ? 'activé' : 'désactivé'} avec succès`,
        'success'
      );
      loadRoles();
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de la modification', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des rôles tiers</Typography>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
            }
            label="Afficher les inactifs"
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDrawer()}
          >
            Nouveau rôle
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Couleur</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Aucun rôle trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.uuid} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {role.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{role.libelle}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {role.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.couleur}
                          size="small"
                          sx={{
                            backgroundColor: role.couleur,
                            color: '#fff',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.actif ? 'Actif' : 'Inactif'}
                          color={role.actif ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDrawer(role)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(role.uuid)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Drawer de création/édition */}
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
            <Typography variant="h5">
              {editingRole ? 'Modifier le rôle' : 'Nouveau rôle'}
            </Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <TextField
              label="Code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              required
              fullWidth
              helperText="Code unique du rôle (ex: CLIENT, FOURNISSEUR)"
            />
            <TextField
              label="Libellé"
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Couleur"
                type="color"
                value={formData.couleur}
                onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                fullWidth
              />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                />
              }
              label="Actif"
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCloseDrawer} variant="outlined">
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={!formData.code || !formData.libelle}
            >
              {editingRole ? 'Modifier' : 'Créer'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default RolesList;
