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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  OutlinedInput,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CustomAttributeApi } from '../../services/CustomAttributeApi';
import { SocieteApi } from '../../services/SocieteApi';
import {
  CustomAttribute,
  CreateCustomAttributeDto,
  TypeChamp,
  PorteeChamp,
  Societe,
} from '../../types';
import { SnackbarContext } from '../../providers/SnackBarProvider';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

export default function CustomAttributesList() {
  const snackBarProvider = useContext(SnackbarContext);
  const [attributes, setAttributes] = useState<CustomAttribute[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<CustomAttribute | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<CustomAttribute | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [formData, setFormData] = useState<CreateCustomAttributeDto>({
    code: '',
    libelle: '',
    typeChamp: TypeChamp.TEXTE,
    portee: PorteeChamp.GLOBAL,
    obligatoire: false,
    ordreAffichage: 0,
    actif: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attributesData, societesData] = await Promise.all([
        CustomAttributeApi.getAll(),
        SocieteApi.getAll(),
      ]);
      setAttributes(attributesData);
      setSocietes(societesData);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (attribute?: CustomAttribute) => {
    if (attribute) {
      setEditingAttribute(attribute);
      setFormData({
        code: attribute.code,
        libelle: attribute.libelle,
        description: attribute.description,
        typeChamp: attribute.typeChamp,
        portee: attribute.portee,
        societeUuids: attribute.societes?.map(s => s.uuid) || [],
        obligatoire: attribute.obligatoire,
        ordreAffichage: attribute.ordreAffichage,
        optionsListe: attribute.optionsListe,
        valeurParDefaut: attribute.valeurParDefaut,
        actif: attribute.actif,
      });
    } else {
      setEditingAttribute(null);
      setFormData({
        code: '',
        libelle: '',
        typeChamp: TypeChamp.TEXTE,
        portee: PorteeChamp.GLOBAL,
        obligatoire: false,
        ordreAffichage: 0,
        actif: true,
      });
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingAttribute(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAttribute) {
        await CustomAttributeApi.update(editingAttribute.uuid, formData);
      } else {
        await CustomAttributeApi.create(formData);
      }
      handleCloseDrawer();
      await loadData();
      snackBarProvider?.showSnackbarMessage(`Attribut personnalisé sauvegardé avec succès`, "success");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleOpenDeleteDialog = (attribute: CustomAttribute) => {
    setAttributeToDelete(attribute);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAttributeToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!attributeToDelete) return;

    try {
      await CustomAttributeApi.delete(attributeToDelete.uuid);
      handleCloseDeleteDialog();
      await loadData();
      snackBarProvider?.showSnackbarMessage('Champ personnalisé supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur de suppression:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de la suppression', 'error');
    }
  };

  const filteredAttributes = attributes.filter((attribute) => {
    if (!includeInactive && !attribute.actif) {
      return false;
    }
    return true;
  });

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
          Champs Personnalisés
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
            onClick={() => handleOpenDrawer()}
          >
            Nouveau Champ
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
                  <TableCell>Type</TableCell>
                  <TableCell>Portée</TableCell>
                  <TableCell>Société</TableCell>
                  <TableCell>Obligatoire</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">Aucun champ trouvé</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttributes.map((attribute) => (
                    <TableRow key={attribute.uuid} hover>
                      <TableCell>{attribute.code}</TableCell>
                      <TableCell>{attribute.libelle}</TableCell>
                      <TableCell>{attribute.typeChamp}</TableCell>
                      <TableCell>
                        <Chip
                          label={attribute.portee === PorteeChamp.GLOBAL ? 'Global' : 'Société'}
                          size="small"
                          color={attribute.portee === PorteeChamp.GLOBAL ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>
                        {attribute.societes && attribute.societes.length > 0 ? (
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {attribute.societes.map((societe) => (
                              <Chip
                                key={societe.uuid}
                                label={societe.raisonSociale}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {attribute.obligatoire ? (
                          <Chip label="Oui" size="small" color="warning" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={attribute.actif ? 'Actif' : 'Inactif'}
                          color={attribute.actif ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDrawer(attribute)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(attribute)}
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
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" fontWeight={600} mb={3}>
            {editingAttribute ? 'Modifier le champ' : 'Nouveau champ'}
          </Typography>

          <Box display="flex" flexDirection="column" gap={2.5}>
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
            <FormControl fullWidth>
              <InputLabel>Type de champ</InputLabel>
              <Select
                value={formData.typeChamp}
                onChange={(e) =>
                  setFormData({ ...formData, typeChamp: e.target.value as TypeChamp })
                }
                label="Type de champ"
              >
                {Object.values(TypeChamp).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Portée</InputLabel>
              <Select
                value={formData.portee}
                onChange={(e) =>
                  setFormData({ ...formData, portee: e.target.value as PorteeChamp })
                }
                label="Portée"
              >
                <MenuItem value={PorteeChamp.GLOBAL}>Global</MenuItem>
                <MenuItem value={PorteeChamp.SOCIETE}>Société</MenuItem>
              </Select>
            </FormControl>
            {formData.portee === PorteeChamp.SOCIETE && (
              <FormControl fullWidth>
                <InputLabel>Sociétés</InputLabel>
                <Select<string[]>
                  multiple
                  value={formData.societeUuids || []}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      societeUuids: typeof value === 'string' ? value.split(',') : value,
                    });
                  }}
                  input={<OutlinedInput label="Sociétés" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((uuid: string) => {
                        const societe = societes.find((s) => s.uuid === uuid);
                        return (
                          <Chip
                            key={uuid}
                            label={societe?.raisonSociale || uuid}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  label="Sociétés"
                  required
                >
                  {societes.map((societe) => (
                    <MenuItem key={societe.uuid} value={societe.uuid}>
                      {societe.raisonSociale}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Ordre d'affichage"
              type="number"
              value={formData.ordreAffichage}
              onChange={(e) =>
                setFormData({ ...formData, ordreAffichage: parseInt(e.target.value) })
              }
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.obligatoire}
                  onChange={(e) =>
                    setFormData({ ...formData, obligatoire: e.target.checked })
                  }
                />
              }
              label="Champ obligatoire ?"
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
              label="Actif ?"
            />
            <Box display="flex" gap={2} mt={2}>
              <Button
                onClick={handleCloseDrawer}
                variant="outlined"
                fullWidth
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                fullWidth
              >
                {editingAttribute ? 'Modifier' : 'Créer'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression du champ personnalisé"
        message="Cette action est irréversible. Pour confirmer la suppression, veuillez saisir"
        itemName={attributeToDelete ? `${attributeToDelete.libelle} (${attributeToDelete.code})` : ''}
        confirmationText="supprimer"
      />
    </Box>
  );
}
