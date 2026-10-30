import { useState, useEffect, useContext } from "react";
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AccountBalance as AccountBalanceIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { SocieteApi } from "../../services/SocieteApi";
import { Societe, CreateSocieteDto } from "../../types";
import { SnackbarContext } from "../../providers/SnackBarProvider";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import ValueListAutocomplete from "../../components/ValueListAutocomplete";
import SocieteRibsManager from "../../components/SocieteRibsManager";
import {
  formatSiren,
  formatSiret,
  unformatSiren,
  unformatSiret,
} from "../../utils/formatters";

export default function SocietesList() {
  const snackBarProvider = useContext(SnackbarContext);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSociete, setEditingSociete] = useState<Societe | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [societeToDelete, setSocieteToDelete] = useState<Societe | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [ribsManagerOpen, setRibsManagerOpen] = useState(false);
  const [selectedSocieteForRibs, setSelectedSocieteForRibs] =
    useState<Societe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<CreateSocieteDto>({
    code: "",
    raisonSociale: "",
    description: "",
    actif: true,
    lblCapitalSocial: "",
    adresseRue: "",
    adresseComplement: "",
    codePostal: "",
    ville: "",
    pays: "",
    regimeTva: "",
    identifiantTva: "",
    emailContact: "",
    dossierSftpPa: "",
    formatExportPa: undefined,
  });

  useEffect(() => {
    loadSocietes();
  }, [includeInactive]);

  const loadSocietes = async () => {
    try {
      setLoading(true);
      const data = await SocieteApi.getAll(includeInactive);
      setSocietes(data);
    } catch (error) {
      console.error("Erreur de chargement des sociétés:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (societe?: Societe) => {
    if (societe) {
      setEditingSociete(societe);
      setFormData({
        code: societe.code,
        raisonSociale: societe.raisonSociale,
        description: societe.description,
        actif: societe.actif,
        siren: societe.siren,
        siret: societe.siret,
        formeJuridique: societe.formeJuridique,
        lblCapitalSocial: societe.lblCapitalSocial,
        adresseRue: societe.adresseRue,
        adresseComplement: societe.adresseComplement,
        codePostal: societe.codePostal,
        ville: societe.ville,
        pays: societe.pays,
        regimeTva: societe.regimeTva,
        identifiantTva: societe.identifiantTva,
        emailContact: societe.emailContact,
        dossierSftpPa: societe.dossierSftpPa,
        formatExportPa: societe.formatExportPa,
      });
    } else {
      setEditingSociete(null);
      setFormData({
        code: "",
        raisonSociale: "",
        description: "",
        actif: true,
        lblCapitalSocial: "",
        adresseRue: "",
        adresseComplement: "",
        codePostal: "",
        ville: "",
        pays: "",
        regimeTva: "",
        identifiantTva: "",
        emailContact: "",
        dossierSftpPa: "",
        formatExportPa: undefined,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSociete(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingSociete) {
        await SocieteApi.update(editingSociete.uuid, formData);
      } else {
        await SocieteApi.create(formData);
      }
      snackBarProvider?.showSuccessMessage();
      handleCloseDialog();
      loadSocietes();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleOpenDeleteDialog = (societe: Societe) => {
    setSocieteToDelete(societe);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSocieteToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!societeToDelete) return;

    try {
      await SocieteApi.delete(societeToDelete.uuid);
      handleCloseDeleteDialog();
      loadSocietes();
      snackBarProvider?.showSnackbarMessage(
        "Société supprimée avec succès",
        "success",
      );
    } catch (error) {
      console.error("Erreur de suppression:", error);
      snackBarProvider?.showSnackbarMessage(
        "Erreur lors de la suppression",
        "error",
      );
    }
  };

  const handleOpenRibsManager = (societe: Societe) => {
    setSelectedSocieteForRibs(societe);
    setRibsManagerOpen(true);
  };

  const handleCloseRibsManager = () => {
    setRibsManagerOpen(false);
    setSelectedSocieteForRibs(null);
  };

  const filteredSocietes = societes.filter((societe) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      societe.code.toLowerCase().includes(query) ||
      societe.raisonSociale.toLowerCase().includes(query) ||
      societe.siren?.toLowerCase().includes(query) ||
      societe.siret?.toLowerCase().includes(query) ||
      societe.ville?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" fontWeight={600}>
          Gestion des Sociétés
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
            Nouvelle Société
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Rechercher par code, raison sociale, SIREN, SIRET, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>SIREN</TableCell>
                  <TableCell>SIRET</TableCell>
                  <TableCell>Raison sociale</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSocietes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        Aucune société trouvée
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSocietes.map((societe) => (
                    <TableRow key={societe.uuid} hover>
                      <TableCell>{societe.code}</TableCell>
                      <TableCell>{formatSiren(societe.siren) || "-"}</TableCell>
                      <TableCell>{formatSiret(societe.siret) || "-"}</TableCell>
                      <TableCell>{societe.raisonSociale}</TableCell>
                      <TableCell>
                        <Chip
                          label={societe.actif ? "Actif" : "Inactif"}
                          color={societe.actif ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRibsManager(societe)}
                          color="primary"
                          title="Gérer les RIB"
                        >
                          <AccountBalanceIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(societe)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(societe)}
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
          sx: { width: { xs: "100%", sm: 500 } },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* En-tête */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" component="h2">
              {editingSociete ? "Modifier la société" : "Nouvelle société"}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu */}
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Raison sociale"
                value={formData.raisonSociale}
                onChange={(e) =>
                  setFormData({ ...formData, raisonSociale: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={4}
                fullWidth
              />
              <TextField
                label="SIREN"
                value={formatSiren(formData.siren)}
                onChange={(e) => {
                  const unformatted = unformatSiren(e.target.value);
                  setFormData({ ...formData, siren: unformatted });
                }}
                placeholder="123 456 789"
                inputProps={{ maxLength: 11 }}
                fullWidth
              />
              <TextField
                label="SIRET"
                value={formatSiret(formData.siret)}
                onChange={(e) => {
                  const unformatted = unformatSiret(e.target.value);
                  setFormData({ ...formData, siret: unformatted });
                }}
                placeholder="123 456 789 01234"
                inputProps={{ maxLength: 17 }}
                fullWidth
              />
              <ValueListAutocomplete
                listCode="FORME_JURIDIQUE"
                value={formData.formeJuridique || null}
                onChange={(code) =>
                  setFormData({ ...formData, formeJuridique: code })
                }
                label="Forme juridique"
              />
              <TextField
                label="Capital social"
                value={formData.lblCapitalSocial || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lblCapitalSocial: e.target.value })
                }
                fullWidth
                multiline
                rows={4}
              />

              <TextField
                label="Adresse (rue)"
                value={formData.adresseRue || ""}
                onChange={(e) =>
                  setFormData({ ...formData, adresseRue: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Complément d'adresse"
                value={formData.adresseComplement || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adresseComplement: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Code postal"
                value={formData.codePostal || ""}
                onChange={(e) =>
                  setFormData({ ...formData, codePostal: e.target.value })
                }
                inputProps={{ maxLength: 10 }}
                fullWidth
              />
              <TextField
                label="Ville"
                value={formData.ville || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ville: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Pays"
                value={formData.pays || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pays: e.target.value })
                }
                fullWidth
              />
              <ValueListAutocomplete
                listCode="REGIME_TVA"
                value={formData.regimeTva || null}
                onChange={(code) =>
                  setFormData({ ...formData, regimeTva: code })
                }
                label="Régime TVA"
              />
              <TextField
                label="Identifiant TVA"
                value={formData.identifiantTva || ""}
                onChange={(e) =>
                  setFormData({ ...formData, identifiantTva: e.target.value })
                }
                inputProps={{ maxLength: 20 }}
                fullWidth
              />
              <TextField
                label="Email de contact"
                type="email"
                value={formData.emailContact || ""}
                onChange={(e) =>
                  setFormData({ ...formData, emailContact: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Dossier SFTP PA"
                value={formData.dossierSftpPa || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dossierSftpPa: e.target.value,
                  })
                }
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Format export PA</InputLabel>
                <Select
                  value={formData.formatExportPa || ""}
                  label="Format export PA"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      formatExportPa: e.target.value as "ZIP" | "XML",
                    })
                  }
                >
                  <MenuItem value="">
                    <em>Aucun</em>
                  </MenuItem>
                  <MenuItem value="ZIP">ZIP</MenuItem>
                  <MenuItem value="XML">XML</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.actif ?? true}
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
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleCloseDialog} variant="outlined">
              Annuler
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingSociete ? "Modifier" : "Créer"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression de la société"
        message="Cette action est irréversible. Pour confirmer la suppression, veuillez saisir"
        itemName={
          societeToDelete
            ? `${societeToDelete.raisonSociale} (${societeToDelete.code})`
            : ""
        }
        confirmationText="supprimer"
      />

      {selectedSocieteForRibs && (
        <SocieteRibsManager
          open={ribsManagerOpen}
          onClose={handleCloseRibsManager}
          societeUuid={selectedSocieteForRibs.uuid}
          societeNom={selectedSocieteForRibs.raisonSociale}
        />
      )}
    </Box>
  );
}
