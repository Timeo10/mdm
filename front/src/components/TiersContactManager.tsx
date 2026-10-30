import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
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
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { TiersContactApi } from '../services/TiersContactApi';
import { useSnackbar } from '../providers/SnackBarProvider';
import { Societe, TiersContact, CreateTiersContactDto } from '../types';

interface TiersContactManagerProps {
  tiersUuid: string;
  isReadOnly: boolean;
  societes: Societe[];
}

const emptyForm: CreateTiersContactDto & { actif?: boolean } = {
  nom: '',
  prenom: '',
  titre: '',
  telephoneFixe: '',
  portable: '',
  email: '',
  societeUuids: [],
};

const TiersContactManager: React.FC<TiersContactManagerProps> = ({
  tiersUuid,
  isReadOnly,
  societes,
}) => {
  const [contacts, setContacts] = useState<TiersContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingContact, setEditingContact] = useState<TiersContact | null>(null);
  const [form, setForm] = useState<CreateTiersContactDto & { actif?: boolean }>({ ...emptyForm });
  const [selectedSocietes, setSelectedSocietes] = useState<Societe[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    contact: TiersContact | null;
  }>({ open: false, contact: null });
  const snackBarProvider = useSnackbar();

  useEffect(() => {
    if (tiersUuid) {
      loadContacts();
    }
  }, [tiersUuid]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await TiersContactApi.getByTiers(tiersUuid);
      setContacts(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des contacts:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors du chargement des contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingContact(null);
    setForm({ ...emptyForm });
    setSelectedSocietes([]);
    setOpenDrawer(true);
  };

  const handleOpenEdit = (contact: TiersContact) => {
    setEditingContact(contact);
    setForm({
      nom: contact.nom,
      prenom: contact.prenom || '',
      titre: contact.titre || '',
      telephoneFixe: contact.telephoneFixe || '',
      portable: contact.portable || '',
      email: contact.email || '',
      societeUuids: contact.societes?.map((s) => s.uuid) || [],
    });
    setSelectedSocietes(
      contact.societes
        ? societes.filter((s) => contact.societes!.some((cs) => cs.uuid === s.uuid))
        : []
    );
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setEditingContact(null);
  };

  const handleSave = async () => {
    if (!form.nom?.trim()) {
      snackBarProvider?.showSnackbarMessage('Le nom est obligatoire', 'error');
      return;
    }

    const payload: CreateTiersContactDto = {
      nom: form.nom,
      prenom: form.prenom || null,
      titre: form.titre || null,
      telephoneFixe: form.telephoneFixe || null,
      portable: form.portable || null,
      email: form.email || null,
      societeUuids: selectedSocietes.map((s) => s.uuid),
    };

    try {
      if (editingContact) {
        await TiersContactApi.update(editingContact.uuid, payload);
        snackBarProvider?.showSnackbarMessage('Contact modifié avec succès', 'success');
      } else {
        await TiersContactApi.create(tiersUuid, payload);
        snackBarProvider?.showSnackbarMessage('Contact créé avec succès', 'success');
      }
      handleCloseDrawer();
      loadContacts();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      const msg = error.response?.data?.message || 'Erreur lors de la sauvegarde du contact';
      snackBarProvider?.showSnackbarMessage(msg, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.contact) return;
    try {
      await TiersContactApi.delete(deleteDialog.contact.uuid);
      snackBarProvider?.showSnackbarMessage('Contact supprimé avec succès', 'success');
      setDeleteDialog({ open: false, contact: null });
      loadContacts();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Contacts
        </Typography>
        {!isReadOnly && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Ajouter un contact
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography>Chargement...</Typography>
      ) : contacts.length === 0 ? (
        <Typography color="text.secondary">Aucun contact.</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell>Tél. fixe</TableCell>
                <TableCell>Portable</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Sociétés</TableCell>
                {!isReadOnly && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.uuid}>
                  <TableCell>{contact.nom}</TableCell>
                  <TableCell>{contact.prenom || '-'}</TableCell>
                  <TableCell>{contact.titre || '-'}</TableCell>
                  <TableCell>{contact.telephoneFixe || '-'}</TableCell>
                  <TableCell>{contact.portable || '-'}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {contact.societes?.map((s) => (
                        <Chip key={s.uuid} label={s.raisonSociale} size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => handleOpenEdit(contact)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, contact })}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Drawer création/édition */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              {editingContact ? 'Modifier le contact' : 'Ajouter un contact'}
            </Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <TextField
              label="Nom"
              required
              fullWidth
              value={form.nom || ''}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <TextField
              label="Prénom"
              fullWidth
              value={form.prenom || ''}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />
            <TextField
              label="Titre"
              fullWidth
              value={form.titre || ''}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
            />
            <TextField
              label="Téléphone fixe"
              fullWidth
              value={form.telephoneFixe || ''}
              onChange={(e) => setForm({ ...form, telephoneFixe: e.target.value })}
            />
            <TextField
              label="Portable"
              fullWidth
              value={form.portable || ''}
              onChange={(e) => setForm({ ...form, portable: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Autocomplete
              multiple
              options={societes}
              getOptionLabel={(option) => option.raisonSociale}
              value={selectedSocietes}
              onChange={(_, newValue) => setSelectedSocietes(newValue)}
              isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
              renderInput={(params) => (
                <TextField {...params} label="Sociétés" placeholder="Rechercher une société..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option.raisonSociale} size="small" {...getTagProps({ index })} />
                ))
              }
              noOptionsText="Aucune société trouvée"
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCloseDrawer} variant="outlined">
              Annuler
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={!form.nom?.trim()}>
              {editingContact ? 'Modifier' : 'Ajouter'}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Dialog suppression */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, contact: null })}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression du contact"
        message={`Vous êtes sur le point de supprimer le contact ${deleteDialog.contact?.prenom ?? ''} ${deleteDialog.contact?.nom ?? ''}. Cette action est irréversible. Pour confirmer, veuillez saisir`}
        itemName={`${deleteDialog.contact?.prenom ?? ''} ${deleteDialog.contact?.nom ?? ''}`.trim()}
      />
    </Box>
  );
};

export default TiersContactManager;
