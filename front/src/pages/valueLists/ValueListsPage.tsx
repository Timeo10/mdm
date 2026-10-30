import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Drawer,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  DragIndicator as DragIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { ValueListApi } from '../../services/ValueListApi';
import { ValueList, CreateValueListDto, ValueListItem } from '../../types';
import { SnackbarContext } from '../../providers/SnackBarProvider';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

export default function ValueListsPage() {
  const snackBarProvider = useContext(SnackbarContext);
  const [valueLists, setValueLists] = useState<ValueList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValueList, setEditingValueList] = useState<ValueList | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valueListToDelete, setValueListToDelete] = useState<ValueList | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [formData, setFormData] = useState<CreateValueListDto>({
    code: '',
    libelle: '',
    description: '',
    actif: true,
    items: [],
  });

  useEffect(() => {
    loadValueLists();
  }, [includeInactive]);

  const loadValueLists = async () => {
    try {
      setLoading(true);
      const data = await ValueListApi.getAll(includeInactive);
      setValueLists(data);
    } catch (error) {
      console.error('Erreur de chargement des listes de valeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (valueList?: ValueList) => {
    if (valueList) {
      setEditingValueList(valueList);
      setFormData({
        code: valueList.code,
        libelle: valueList.libelle,
        description: valueList.description,
        actif: valueList.actif,
        items: valueList.items?.map(item => ({
          uuid: item.uuid,
          code: item.code,
          libelle: item.libelle,
          ordre: item.ordre,
          actif: item.actif,
        })) || [],
      });
    } else {
      setEditingValueList(null);
      setFormData({
        code: '',
        libelle: '',
        description: '',
        actif: true,
        items: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingValueList(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingValueList) {
        await ValueListApi.update(editingValueList.uuid, formData);
      } else {
        await ValueListApi.create(formData);
      }
      snackBarProvider?.showSuccessMessage();
      handleCloseDialog();
      loadValueLists();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleOpenDeleteDialog = (valueList: ValueList) => {
    setValueListToDelete(valueList);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setValueListToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!valueListToDelete) return;

    try {
      await ValueListApi.delete(valueListToDelete.uuid);
      handleCloseDeleteDialog();
      loadValueLists();
      snackBarProvider?.showSnackbarMessage('Liste de valeurs supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur de suppression:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de la suppression', 'error');
    }
  };

  const handleAddItem = () => {
    const newItem: ValueListItem = {
      code: '',
      libelle: '',
      ordre: formData.items?.length || 0,
      actif: true,
    };
    setFormData({
      ...formData,
      items: [...(formData.items || []), newItem],
    });
  };

  const handleUpdateItem = (index: number, field: keyof ValueListItem, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = formData.items?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, items: updatedItems });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(formData.items || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

    // Mettre à jour les ordres
    items.forEach((item, i) => {
      item.ordre = i;
    });

    setFormData({ ...formData, items });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Listes de valeurs
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
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
            onClick={() => handleOpenDialog()}
          >
            Nouvelle liste
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Nombre d'items</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {valueLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">Aucune liste de valeurs trouvée</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  valueLists.map((valueList) => (
                    <TableRow key={valueList.uuid} hover>
                      <TableCell>{valueList.code}</TableCell>
                      <TableCell>{valueList.libelle}</TableCell>
                      <TableCell>{valueList.items?.length || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={valueList.actif ? 'Actif' : 'Inactif'}
                          color={valueList.actif ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDialog(valueList)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(valueList)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 700 } },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            <Typography variant="h6" component="h2">
              {editingValueList ? 'Modifier la liste' : 'Nouvelle liste'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                fullWidth
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
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.actif ?? true}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  />
                }
                label="Actif"
              />

              <Divider />

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Items de la liste</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                  >
                    Ajouter un item
                  </Button>
                </Box>

                {formData.items && formData.items.length > 0 ? (
                  <List>
                    {formData.items.map((item, index) => (
                      <Paper key={index} sx={{ mb: 2, p: 2 }}>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Box display="flex" flexDirection="column" gap={0.5} pt={2}>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveItem(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveItem(index, 'down')}
                              disabled={index === formData.items!.length - 1}
                            >
                              <ArrowDownIcon />
                            </IconButton>
                          </Box>

                          <Box flexGrow={1} display="flex" flexDirection="column" gap={2}>
                            <TextField
                              label="Code"
                              value={item.code}
                              onChange={(e) => handleUpdateItem(index, 'code', e.target.value)}
                              required
                              fullWidth
                              size="small"
                            />
                            <TextField
                              label="Libellé"
                              value={item.libelle}
                              onChange={(e) => handleUpdateItem(index, 'libelle', e.target.value)}
                              required
                              fullWidth
                              size="small"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={item.actif}
                                  onChange={(e) => handleUpdateItem(index, 'actif', e.target.checked)}
                                  size="small"
                                />
                              }
                              label="Actif"
                            />
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => handleDeleteItem(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Aucun item. Cliquez sur "Ajouter un item" pour commencer.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Divider />
          <Box
            sx={{
              p: 2,
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button onClick={handleCloseDialog} variant="outlined">
              Annuler
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingValueList ? 'Modifier' : 'Créer'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression de la liste"
        message="Cette action est irréversible. Pour confirmer la suppression, veuillez saisir"
        itemName={valueListToDelete ? `${valueListToDelete.libelle} (${valueListToDelete.code})` : ''}
        confirmationText="supprimer"
      />
    </Box>
  );
}
