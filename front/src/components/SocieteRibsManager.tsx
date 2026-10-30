import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Drawer,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { RibApi } from '../services/RibApi';
import { ValueListApi } from '../services/ValueListApi';
import { Rib, CreateRibDto, UpdateRibDto, ValueListItem } from '../types';
import { SnackbarContext } from '../providers/SnackBarProvider';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

interface SocieteRibsManagerProps {
  open: boolean;
  onClose: () => void;
  societeUuid: string;
  societeNom: string;
}

export default function SocieteRibsManager({
  open,
  onClose,
  societeUuid,
  societeNom,
}: SocieteRibsManagerProps) {
  const { showSnackbarMessage } = useContext(SnackbarContext) || {};
  const [ribs, setRibs] = useState<Rib[]>([]);
  const [typeIbanItems, setTypeIbanItems] = useState<ValueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRib, setEditingRib] = useState<Rib | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ribToDelete, setRibToDelete] = useState<Rib | null>(null);
  const [formData, setFormData] = useState<CreateRibDto | UpdateRibDto>({
    societeUuid,
    typeIbanCode: '',
    iban: '',
    bic: '',
    titulaire: '',
    banque: '',
    ics: '',
    actif: true,
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, societeUuid]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ribsData, valueListData] = await Promise.all([
        RibApi.getBySociete(societeUuid, true),
        ValueListApi.getByCode('TYPE_IBAN'),
      ]);
      setRibs(ribsData);
      setTypeIbanItems(valueListData.items || []);
    } catch (error) {
      console.error('Erreur de chargement des RIB:', error);
      showSnackbarMessage?.('Erreur lors du chargement des RIB', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (rib?: Rib) => {
    if (rib) {
      setEditingRib(rib);
      setFormData({
        typeIbanCode: rib.typeIbanCode,
        iban: rib.iban,
        bic: rib.bic || '',
        titulaire: rib.titulaire,
        banque: rib.banque || '',
        ics: rib.ics || '',
        actif: rib.actif,
      });
    } else {
      setEditingRib(null);
      setFormData({
        societeUuid,
        typeIbanCode: '',
        iban: '',
        bic: '',
        titulaire: '',
        banque: '',
        ics: '',
        actif: true,
      });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRib(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingRib) {
        await RibApi.update(editingRib.uuid, formData as UpdateRibDto);
        showSnackbarMessage?.('RIB modifié avec succès', 'success');
        handleCloseForm();
      } else {
        await RibApi.create(formData as CreateRibDto);
        showSnackbarMessage?.('RIB créé avec succès', 'success');
        handleCloseForm();
      }
      loadData();
    } catch (error: any) {
      const errorMessage = error?.error || 'Erreur lors de la sauvegarde du RIB';
      showSnackbarMessage?.(errorMessage, 'error');
    }
  };

  const handleDeleteClick = (rib: Rib) => {
    setRibToDelete(rib);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ribToDelete) return;

    try {
      await RibApi.delete(ribToDelete.uuid);
      showSnackbarMessage?.('RIB supprimé avec succès', 'success');
      setDeleteDialogOpen(false);
      setRibToDelete(null);
      loadData();
    } catch (error: any) {
      const errorMessage = error?.error || 'Erreur lors de la suppression du RIB';
      showSnackbarMessage?.(errorMessage, 'error');
    }
  };

  const formatIban = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  const getTypeIbanLibelle = (code: string) => {
    const item = typeIbanItems.find((item) => item.code === code);
    return item?.libelle || code;
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: '100%', md: '80%', lg: '70%' } },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* En-tête */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <AccountBalanceIcon color="primary" />
              <Box>
                <Typography variant="h6" component="h2">
                  Gestion des RIB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {societeNom}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" color="text.secondary">
                    {ribs.length} RIB{ribs.length > 1 ? 's' : ''} enregistré{ribs.length > 1 ? 's' : ''}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                  >
                    Ajouter un RIB
                  </Button>
                </Box>

                {ribs.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" variant="h6" gutterBottom>
                      Aucun RIB enregistré
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Ajoutez un premier RIB pour cette société
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>IBAN</TableCell>
                          <TableCell>BIC</TableCell>
                          <TableCell>Titulaire</TableCell>
                          <TableCell>Banque</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ribs.map((rib) => (
                          <TableRow key={rib.uuid} hover>
                            <TableCell>
                              <Chip
                                label={getTypeIbanLibelle(rib.typeIbanCode)}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {formatIban(rib.iban)}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {rib.bic || '-'}
                            </TableCell>
                            <TableCell>{rib.titulaire}</TableCell>
                            <TableCell>{rib.banque || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                label={rib.actif ? 'Actif' : 'Inactif'}
                                color={rib.actif ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenForm(rib)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(rib)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Drawer du formulaire d'ajout/modification */}
      <Drawer
        anchor="right"
        open={formOpen}
        onClose={handleCloseForm}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* En-tête */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={handleCloseForm} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" component="h2">
                {editingRib ? 'Modifier le RIB' : 'Ajouter un RIB'}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseForm}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu du formulaire */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                select
                label="Type d'IBAN"
                value={formData.typeIbanCode}
                onChange={(e) =>
                  setFormData({ ...formData, typeIbanCode: e.target.value })
                }
                fullWidth
                required
              >
                {typeIbanItems
                  .filter((item) => item.actif)
                  .sort((a, b) => a.ordre - b.ordre)
                  .map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.libelle}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                label="IBAN"
                value={formData.iban}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value.toUpperCase() })
                }
                fullWidth
                required
                placeholder="FR7630001007941234567890185"
                helperText="Format: 2 lettres + 2 chiffres + jusqu'à 30 caractères alphanumériques"
              />

              <TextField
                label="BIC/SWIFT"
                value={formData.bic}
                onChange={(e) =>
                  setFormData({ ...formData, bic: e.target.value.toUpperCase() })
                }
                fullWidth
                placeholder="BNPAFRPPXXX"
                helperText="Code BIC/SWIFT de la banque (optionnel)"
              />

              <TextField
                label="Titulaire du compte"
                value={formData.titulaire}
                onChange={(e) =>
                  setFormData({ ...formData, titulaire: e.target.value })
                }
                fullWidth
                required
              />

              <TextField
                label="Nom de la banque"
                value={formData.banque}
                onChange={(e) =>
                  setFormData({ ...formData, banque: e.target.value })
                }
                fullWidth
                helperText="Nom de l'établissement bancaire (optionnel)"
              />
                <TextField
                label="ICS"
                value={formData.ics}
                onChange={(e) =>
                  setFormData({ ...formData, ics: e.target.value })
                }
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.actif}
                    onChange={(e) =>
                      setFormData({ ...formData, actif: e.target.checked })
                    }
                  />
                }
                label="Actif"
              />
            </Box>
          </Box>

          {/* Pied de page */}
          <Divider />
          <Box
            sx={{
              p: 2,
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button onClick={handleCloseForm} variant="outlined">
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={
                !formData.typeIbanCode ||
                !formData.iban ||
                !formData.titulaire
              }
            >
              {editingRib ? 'Modifier' : 'Créer'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le RIB"
        message={`Êtes-vous sûr de vouloir supprimer le RIB ${
          ribToDelete ? formatIban(ribToDelete.iban) : ''
        } ?`}
      />
    </>
  );
}
