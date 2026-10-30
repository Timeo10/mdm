import { useState, useEffect, useContext } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Drawer,
  Divider,
  Alert,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { TiersApi } from "../../services/TiersApi";
import { SocieteApi } from "../../services/SocieteApi";
import { CustomAttributeApi } from "../../services/CustomAttributeApi";
import {
  TiersWithSocietes,
  CreateTiersDto,
  Societe,
  CustomAttribute,
  AttachTiersToSocieteDto,
  TypeChamp,
} from "../../types";
import { SnackbarContext } from "../../providers/SnackBarProvider";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import TiersRolesManager from "../../components/TiersRolesManager";
import TiersAuditHistory from "../../components/TiersAuditHistory";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission } from "../../types/permissions";
import ValueListAutocomplete from "../../components/ValueListAutocomplete";
import TiersCoordonneesSection from "../../components/TiersCoordonneesSection";

export default function TiersDetail() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const snackBarProvider = useContext(SnackbarContext);
  const permissions = usePermissions();

  const isNew = uuid === "new";
  const viewMode = searchParams.get("mode") === "view";

  // Mode lecture seule: soit l'utilisateur n'a pas la permission UPDATE, soit le mode est forcé à 'view'
  const isReadOnly =
    viewMode ||
    (isNew
      ? !permissions.can(Permission.TIERS_CREATE)
      : !permissions.can(Permission.TIERS_UPDATE));

  // Récupérer les données du sas d'entrée si présentes
  const gatewayData = location.state as {
    siren?: string;
    siret?: string;
    raisonSociale?: string;
  } | null;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<TiersWithSocietes | null>(null);
  const [formData, setFormData] = useState<CreateTiersDto>({
    typeTiers: "Entreprise",
    codeTiersMdm: undefined,
    actif: true,
    siren: gatewayData?.siren || undefined,
    siret: gatewayData?.siret || undefined,
    raisonSociale: gatewayData?.raisonSociale || undefined,
    nomCommercial: undefined,
    formeJuridique: undefined,
    typeEntreprise: undefined,
    capitalSocial: undefined,
    nomPrenom: undefined,
    villeRegistre: undefined,
    dateImmatriculation: undefined,
    codeTvaIntracom: undefined,
    regimeTva: undefined,
    paysIso: undefined,
    natureAdresse: undefined,
    adresseLigne1: undefined,
    adresseLigne2: undefined,
    adresseLigne3: undefined,
    cedex: undefined,
    codePostal: undefined,
    ville: undefined,
    region: undefined,
    emailFacturation: undefined,
    iban: undefined,
    bic: undefined,
    modePaiement: undefined,
    delaiPaiementJours: undefined,
    refCommandeObligatoire: undefined,
  });

  const [societes, setSocietes] = useState<Societe[]>([]);
  const [attachDrawerOpen, setAttachDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedSociete, setSelectedSociete] = useState<string>("");
  const [codeTiersErp, setCodeTiersErp] = useState<string>("");
  const [fraisGeneraux, setFraisGeneraux] = useState<boolean>(false);
  const [fraisMetier, setFraisMetier] = useState<boolean>(false);
  const [codeAdressagePa, setCodeAdressagePa] = useState<string>("");
  const [codeRoutageAdvEntrant, setCodeRoutageAdvEntrant] =
    useState<string>("");
  const [editingTiersSociete, setEditingTiersSociete] = useState<{
    uuid: string;
    societeUuid: string;
    societeNom: string;
    codeTiersErp: string;
    fraisGeneraux: boolean;
    fraisMetier: boolean;
    codeAdressagePa: string;
    codeRoutageAdvEntrant: string;
    actif: boolean;
    customAttributes?: Record<string, string>;
  } | null>(null);
  const [globalAttributes, setGlobalAttributes] = useState<CustomAttribute[]>(
    [],
  );
  const [societeAttributes, setSocieteAttributes] = useState<CustomAttribute[]>(
    [],
  );
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({});
  const [formErrors, setFormErrors] = useState<
    Partial<Record<"paysIso" | "siret" | "codeTvaIntracom", string>>
  >({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tiersSocieteToDelete, setTiersSocieteToDelete] = useState<{
    uuid: string;
    nom: string;
  } | null>(null);
  const [auditRefreshTrigger, setAuditRefreshTrigger] = useState(0);

  useEffect(() => {
    loadData();
  }, [uuid]);

  const loadGlobalAttributes = async () => {
    try {
      const allAttributes = await CustomAttributeApi.getAll();
      console.log("All attributes:", allAttributes);
      const globals = allAttributes.filter((attr) => attr.portee === "global");
      console.log("Global attributes:", globals);
      setGlobalAttributes(globals);
    } catch (error) {
      console.error("Erreur de chargement des attributs globaux:", error);
      snackBarProvider?.showSnackbarMessage(
        "Erreur lors du chargement des attributs globaux",
        "error",
      );
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const societesData = await SocieteApi.getAll();
      setSocietes(societesData);

      // Toujours charger les attributs globaux
      await loadGlobalAttributes();

      if (!isNew && uuid) {
        const tiersData = await TiersApi.getWithSocietes(uuid);
        setTiers(tiersData);
        setFormData({
          typeTiers: tiersData.typeTiers,
          codeTiersMdm: tiersData.codeTiersMdm,
          siren: tiersData.siren,
          siret: tiersData.siret,
          raisonSociale: tiersData.raisonSociale,
          nomCommercial: tiersData.nomCommercial,
          formeJuridique: tiersData.formeJuridique,
          typeEntreprise: tiersData.typeEntreprise,
          capitalSocial: tiersData.capitalSocial,
          nomPrenom: tiersData.nomPrenom,
          villeRegistre: tiersData.villeRegistre,
          dateImmatriculation: tiersData.dateImmatriculation,
          codeTvaIntracom: tiersData.codeTvaIntracom,
          regimeTva: tiersData.regimeTva,
          paysIso: tiersData.paysIso,
          natureAdresse: tiersData.natureAdresse,
          adresseLigne1: tiersData.adresseLigne1,
          adresseLigne2: tiersData.adresseLigne2,
          adresseLigne3: tiersData.adresseLigne3,
          cedex: tiersData.cedex,
          codePostal: tiersData.codePostal,
          ville: tiersData.ville,
          region: tiersData.region,
          emailFacturation: tiersData.emailFacturation,
          iban: tiersData.iban,
          bic: tiersData.bic,
          modePaiement: tiersData.modePaiement,
          delaiPaiementJours: tiersData.delaiPaiementJours,
          refCommandeObligatoire: tiersData.refCommandeObligatoire,
          actif: tiersData.actif ?? true,
        });

        // Charger les valeurs des attributs globaux
        console.log("tiersData:", tiersData);
        console.log("tiersData.globalAttributes:", tiersData.globalAttributes);
        if (tiersData.globalAttributes) {
          console.log("Setting attribute values:", tiersData.globalAttributes);
          const attrs: Record<string, string> = {};
          Object.entries(tiersData.globalAttributes).forEach(([key, value]) => {
            attrs[key] = (value as string) || "";
          });
          setAttributeValues(attrs);
        }
      }
    } catch (error) {
      console.error("Erreur de chargement:", error);
      snackBarProvider?.showSnackbarMessage(
        "Erreur lors du chargement des données",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getTiersValidationErrors = () => {
    const paysIso = formData.paysIso?.trim().toUpperCase();
    const siret = formData.siret?.trim();
    const codeTvaIntracom = formData.codeTvaIntracom?.trim();
    const errors: Partial<
      Record<"paysIso" | "siret" | "codeTvaIntracom", string>
    > = {};

    if (!paysIso) {
      errors.paysIso = "Le code pays est obligatoire";
    } else if (paysIso === "FR" && !siret) {
      errors.siret = "Le SIRET est obligatoire pour un tiers en France";
    } else if (paysIso !== "FR" && !codeTvaIntracom) {
      errors.codeTvaIntracom =
        "Le code TVA intracommunautaire est obligatoire hors France";
    }

    return errors;
  };

  const clearFormErrors = (
    fields: Array<"paysIso" | "siret" | "codeTvaIntracom">,
  ) => {
    setFormErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      fields.forEach((field) => {
        delete nextErrors[field];
      });
      return nextErrors;
    });
  };

  const handleSave = async () => {
    const validationErrors = getTiersValidationErrors();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      snackBarProvider?.showSnackbarMessage(
        "Veuillez renseigner les champs obligatoires du tiers",
        "error",
      );
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        // Ajouter les attributs globaux aux données du formulaire
        const createData = {
          ...formData,
          globalAttributes:
            Object.keys(attributeValues).length > 0
              ? attributeValues
              : undefined,
        };
        const newTiers = await TiersApi.create(createData);
        snackBarProvider?.showSnackbarMessage(
          "Tiers créé avec succès",
          "success",
        );
        navigate(`/tiers/${newTiers.uuid}`);
      } else if (uuid) {
        // Ajouter les attributs globaux aux données de mise à jour
        const updateData = {
          ...formData,
          globalAttributes:
            Object.keys(attributeValues).length > 0
              ? attributeValues
              : undefined,
        };
        await TiersApi.update(uuid, updateData);
        snackBarProvider?.showSnackbarMessage(
          "Tiers mis à jour avec succès",
          "success",
        );
        loadData();
      }
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAttachDrawer = async () => {
    setAttachDrawerOpen(true);
    setSelectedSociete("");
    setCodeTiersErp("");
    setFraisGeneraux(false);
    setFraisMetier(false);
    setCodeAdressagePa("");
    setCodeRoutageAdvEntrant("");
    // Réinitialiser uniquement les attributs de société, pas les globaux
    const newAttributeValues: Record<string, string> = {};
    // Garder les attributs globaux
    globalAttributes.forEach((attr) => {
      if (attributeValues[attr.code]) {
        newAttributeValues[attr.code] = attributeValues[attr.code];
      }
    });
    setAttributeValues(newAttributeValues);
  };

  const handleCloseAttachDrawer = () => {
    setAttachDrawerOpen(false);
    setSelectedSociete("");
    setCodeTiersErp("");
    setFraisGeneraux(false);
    setFraisMetier(false);
    setCodeAdressagePa("");
    setCodeRoutageAdvEntrant("");
    setSocieteAttributes([]);
    // Réinitialiser les attributeValues en gardant seulement les globaux
    const newAttributeValues: Record<string, string> = {};
    globalAttributes.forEach((attr) => {
      if (attributeValues[attr.code]) {
        newAttributeValues[attr.code] = attributeValues[attr.code];
      }
    });
    setAttributeValues(newAttributeValues);
  };

  const loadAttributesForSociete = async (societeUuid: string) => {
    try {
      const allAttributes = await CustomAttributeApi.getBySociete(societeUuid);
      // Récupérer uniquement les attributs spécifiques à la société (pas les globaux)
      const societes = allAttributes.filter(
        (attr) => attr.portee === "societe",
      );
      setSocieteAttributes(societes);
    } catch (error) {
      console.error("Erreur de chargement des attributs:", error);
      snackBarProvider?.showSnackbarMessage(
        "Erreur lors du chargement des attributs de la société",
        "error",
      );
    }
  };

  const handleSocieteChange = (societeUuid: string) => {
    setSelectedSociete(societeUuid);
    if (societeUuid) {
      loadAttributesForSociete(societeUuid);
    } else {
      setSocieteAttributes([]);
    }
    // Garder les attributs globaux, réinitialiser seulement ceux de la société
    const newAttributeValues: Record<string, string> = {};
    globalAttributes.forEach((attr) => {
      if (attributeValues[attr.code]) {
        newAttributeValues[attr.code] = attributeValues[attr.code];
      }
    });
    setAttributeValues(newAttributeValues);
  };

  const handleAttachToSociete = async () => {
    if (!selectedSociete || !uuid) return;

    try {
      // Filtrer pour n'envoyer que les attributs de la société (pas les globaux)
      const societeAttributesValues: Record<string, string | null> = {};
      societeAttributes.forEach((attr) => {
        if (attributeValues[attr.code] !== undefined) {
          societeAttributesValues[attr.code] = attributeValues[attr.code];
        }
      });

      const attachData: AttachTiersToSocieteDto = {
        tiersUuid: uuid,
        societeUuid: selectedSociete,
        codeTiersErp: codeTiersErp || undefined,
        fraisGeneraux,
        fraisMetier,
        codeAdressagePa: codeAdressagePa || undefined,
        codeRoutageAdvEntrant: codeRoutageAdvEntrant || undefined,
        actif: true,
        customAttributes:
          Object.keys(societeAttributesValues).length > 0
            ? societeAttributesValues
            : undefined,
      };

      await TiersApi.attachToSociete(attachData);
      snackBarProvider?.showSnackbarMessage(
        "Tiers attaché à la société avec succès",
        "success",
      );
      handleCloseAttachDrawer();
      loadData();
    } catch (error) {
      console.error("Erreur d'attachement:", error);
    }
  };

  const handleOpenDetachDialog = (
    tiersSocieteUuid: string,
    societeNom: string,
  ) => {
    setTiersSocieteToDelete({ uuid: tiersSocieteUuid, nom: societeNom });
    setDeleteDialogOpen(true);
  };

  const handleCloseDetachDialog = () => {
    setDeleteDialogOpen(false);
    setTiersSocieteToDelete(null);
  };

  const handleConfirmDetach = async () => {
    if (!tiersSocieteToDelete) return;

    try {
      await TiersApi.detachFromSociete(tiersSocieteToDelete.uuid);
      snackBarProvider?.showSnackbarMessage(
        "Tiers détaché de la société avec succès",
        "success",
      );
      handleCloseDetachDialog();
      loadData();
    } catch (error) {
      console.error("Erreur de détachement:", error);
    }
  };

  const handleOpenEditDialog = async (tiersSociete: any) => {
    setEditingTiersSociete({
      uuid: tiersSociete.uuid,
      societeUuid: tiersSociete.societe?.uuid || "",
      societeNom: tiersSociete.societe?.raisonSociale || "",
      codeTiersErp: tiersSociete.codeTiersErp || "",
      fraisGeneraux: tiersSociete.fraisGeneraux ?? false,
      fraisMetier: tiersSociete.fraisMetier ?? false,
      codeAdressagePa: tiersSociete.codeAdressagePa || "",
      codeRoutageAdvEntrant: tiersSociete.codeRoutageAdvEntrant || "",
      actif: tiersSociete.actif ?? true,
      customAttributes: tiersSociete.customAttributes || {},
    });
    setCodeTiersErp(tiersSociete.codeTiersErp || "");
    setFraisGeneraux(tiersSociete.fraisGeneraux ?? false);
    setFraisMetier(tiersSociete.fraisMetier ?? false);
    setCodeAdressagePa(tiersSociete.codeAdressagePa || "");

    // Charger les attributs de la société
    if (tiersSociete.societe?.uuid) {
      await loadAttributesForSociete(tiersSociete.societe.uuid);
    }

    // Initialiser les valeurs des attributs (convertir en string)
    const attrs: Record<string, string> = {};
    if (tiersSociete.customAttributes) {
      Object.entries(tiersSociete.customAttributes).forEach(([key, value]) => {
        attrs[key] = (value as string) || "";
      });
    }
    setAttributeValues(attrs);
    setEditDrawerOpen(true);
  };

  const handleCloseEditDrawer = () => {
    setEditDrawerOpen(false);
    setEditingTiersSociete(null);
    setCodeTiersErp("");
    setFraisGeneraux(false);
    setFraisMetier(false);
    setCodeAdressagePa("");
    setAttributeValues({});
    setSocieteAttributes([]);
  };

  const handleUpdateTiersSociete = async () => {
    if (!editingTiersSociete) return;

    try {
      // Préparer les attributs personnalisés
      const societeAttributesValues: Record<string, string | null> = {};
      societeAttributes.forEach((attr) => {
        if (attributeValues[attr.code] !== undefined) {
          societeAttributesValues[attr.code] = attributeValues[attr.code];
        }
      });

      const updateData: AttachTiersToSocieteDto = {
        tiersUuid: uuid!,
        societeUuid: editingTiersSociete.societeUuid,
        codeTiersErp: codeTiersErp || undefined,
        fraisGeneraux: editingTiersSociete.fraisGeneraux,
        fraisMetier: editingTiersSociete.fraisMetier,
        codeAdressagePa: editingTiersSociete.codeAdressagePa || undefined,
        codeRoutageAdvEntrant:
          editingTiersSociete.codeRoutageAdvEntrant || undefined,
        actif: editingTiersSociete.actif,
        customAttributes:
          Object.keys(societeAttributesValues).length > 0
            ? societeAttributesValues
            : undefined,
      };

      await TiersApi.updateTiersSociete(editingTiersSociete.uuid, updateData);
      snackBarProvider?.showSnackbarMessage(
        "Société mise à jour avec succès",
        "success",
      );
      handleCloseEditDrawer();
      loadData();
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
    }
  };

  const handleUpdateCustomAttribute = async (
    tiersSocieteUuid: string,
    attributeUuid: string,
    valeur: string | null,
  ) => {
    try {
      await TiersApi.updateCustomAttribute(
        tiersSocieteUuid,
        attributeUuid,
        valeur,
      );
      snackBarProvider?.showSnackbarMessage(
        "Attribut mis à jour avec succès",
        "success",
      );
    } catch (error) {
      console.error("Erreur de mise à jour de l'attribut:", error);
    }
  };

  const renderAttributeInput = (
    attribute: CustomAttribute,
    value: string,
    onChange: (value: string) => void,
    readOnly: boolean = false,
  ) => {
    switch (attribute.typeChamp) {
      case TypeChamp.BOOLEEN:
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value === "true"}
                onChange={(e) => onChange(e.target.checked ? "true" : "false")}
                disabled={readOnly}
              />
            }
            label={attribute.libelle}
          />
        );
      case TypeChamp.NOMBRE:
        return (
          <TextField
            fullWidth
            label={attribute.libelle}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={attribute.obligatoire}
            InputProps={{ readOnly }}
          />
        );
      case TypeChamp.DATE:
        return (
          <TextField
            fullWidth
            label={attribute.libelle}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={attribute.obligatoire}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly }}
          />
        );
      case TypeChamp.LISTE:
        return (
          <FormControl fullWidth>
            <InputLabel>{attribute.libelle}</InputLabel>
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              label={attribute.libelle}
              required={attribute.obligatoire}
              readOnly={readOnly}
            >
              <MenuItem value="">
                <em>Aucun</em>
              </MenuItem>
              {attribute.optionsListe?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return (
          <TextField
            fullWidth
            label={attribute.libelle}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={attribute.obligatoire}
            type={
              attribute.typeChamp === TypeChamp.EMAIL
                ? "email"
                : attribute.typeChamp === TypeChamp.TELEPHONE
                  ? "tel"
                  : attribute.typeChamp === TypeChamp.URL
                    ? "url"
                    : "text"
            }
            InputProps={{ readOnly }}
          />
        );
    }
  };

  const selectedPaysIso = formData.paysIso?.trim().toUpperCase();
  const isFrance = selectedPaysIso === "FR";
  const isForeignCountry = Boolean(selectedPaysIso) && !isFrance;

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
    <Box sx={{ p: 3, pb: !isReadOnly ? 12 : 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate("/tiers")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight={600}>
          {isNew
            ? "Nouveau Tiers"
            : isReadOnly
              ? "Consultation du Tiers"
              : "Détail du Tiers"}
        </Typography>
        <Box flexGrow={1} />
        {isReadOnly ? (
          permissions.can(
            isNew ? Permission.TIERS_CREATE : Permission.TIERS_UPDATE,
          ) && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                searchParams.delete("mode");
                setSearchParams(searchParams);
              }}
            >
              Éditer
            </Button>
          )
        ) : null}
      </Box>

      {/* Alerte mode lecture seule */}
      {permissions.isReadOnly() && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2 }}>
          Vous êtes en mode lecture seule. Vous ne pouvez pas modifier les
          données.
        </Alert>
      )}

      {/* Alerte manque de permission */}
      {!permissions.isReadOnly() && isReadOnly && !viewMode && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2 }}>
          Vous n'avez pas les permissions nécessaires pour modifier ce tiers.
        </Alert>
      )}

      {/* Informations générales */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Informations générales</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Code tiers MDM"
                value={formData.codeTiersMdm || "GÃ©nÃ©rÃ© Ã  l'enregistrement"}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Type de tiers"
                value={formData.typeTiers || ""}
                onChange={(e) =>
                  setFormData({ ...formData, typeTiers: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.actif ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, actif: e.target.checked })
                    }
                    disabled={isReadOnly}
                  />
                }
                label="Actif"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Identification légale */}
      <Accordion sx={{ mt: 2 }} defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Identification légale</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SIREN"
                value={formData.siren || ""}
                onChange={(e) =>
                  setFormData({ ...formData, siren: e.target.value })
                }
                inputProps={{ maxLength: 9 }}
                InputProps={{ readOnly: isReadOnly }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
	                fullWidth
	                label="SIRET"
	                value={formData.siret || ""}
	                onChange={(e) => {
	                  setFormData({ ...formData, siret: e.target.value });
	                  clearFormErrors(["siret"]);
	                }}
	                inputProps={{ maxLength: 14 }}
	                InputProps={{ readOnly: isReadOnly }}
	                required={isFrance}
	                error={Boolean(formErrors.siret)}
	                helperText={formErrors.siret}
	              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Raison sociale"
                value={formData.raisonSociale || ""}
                onChange={(e) =>
                  setFormData({ ...formData, raisonSociale: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nom commercial"
                value={formData.nomCommercial || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nomCommercial: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nom / Prénom"
                value={formData.nomPrenom || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nomPrenom: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ValueListAutocomplete
                listCode="FORME_JURIDIQUE"
                value={formData.formeJuridique || null}
                onChange={(code) =>
                  setFormData({ ...formData, formeJuridique: code || "" })
                }
                label="Forme juridique"
                readOnly={isReadOnly}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Type d'entreprise"
                value={formData.typeEntreprise || ""}
                onChange={(e) =>
                  setFormData({ ...formData, typeEntreprise: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Capital social"
                value={formData.capitalSocial || ""}
                onChange={(e) =>
                  setFormData({ ...formData, capitalSocial: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Ville de registre"
                value={formData.villeRegistre || ""}
                onChange={(e) =>
                  setFormData({ ...formData, villeRegistre: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Date d'immatriculation"
                value={formData.dateImmatriculation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dateImmatriculation: e.target.value,
                  })
                }
                placeholder="YYYY-MM-DD"
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Fiscalité et TVA */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Fiscalité et TVA</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
	                fullWidth
	                label="Code TVA Intracommunautaire"
	                value={formData.codeTvaIntracom || ""}
	                onChange={(e) => {
	                  setFormData({
	                    ...formData,
	                    codeTvaIntracom: e.target.value,
	                  });
	                  clearFormErrors(["codeTvaIntracom"]);
	                }}
	                InputProps={{ readOnly: isReadOnly }}
	                required={isForeignCountry}
	                error={Boolean(formErrors.codeTvaIntracom)}
	                helperText={formErrors.codeTvaIntracom}
	              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Régime TVA"
                value={formData.regimeTva || ""}
                onChange={(e) =>
                  setFormData({ ...formData, regimeTva: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Adresse */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Adresse</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ValueListAutocomplete
	                listCode="PAYS_ISO"
	                value={formData.paysIso || null}
	                onChange={(code) => {
	                  setFormData({ ...formData, paysIso: code || "" });
	                  clearFormErrors(["paysIso", "siret", "codeTvaIntracom"]);
	                }}
	                label="Code Pays"
	                readOnly={isReadOnly}
	                required
	                error={Boolean(formErrors.paysIso)}
	                helperText={formErrors.paysIso}
	              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nature de l'adresse"
                value={formData.natureAdresse || ""}
                onChange={(e) =>
                  setFormData({ ...formData, natureAdresse: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Adresse ligne 1"
                value={formData.adresseLigne1 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, adresseLigne1: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Adresse ligne 2"
                value={formData.adresseLigne2 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, adresseLigne2: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Adresse ligne 3"
                value={formData.adresseLigne3 || ""}
                onChange={(e) =>
                  setFormData({ ...formData, adresseLigne3: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Code postal"
                value={formData.codePostal || ""}
                onChange={(e) =>
                  setFormData({ ...formData, codePostal: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Ville"
                value={formData.ville || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ville: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="CEDEX"
                value={formData.cedex || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cedex: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Région"
                value={formData.region || ""}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Coordonnées et contact */}
      <TiersCoordonneesSection
        formData={formData}
        setFormData={setFormData}
        isReadOnly={isReadOnly}
        tiersUuid={uuid || null}
        isNew={isNew}
        societes={societes}
      />

      {/* Informations bancaires et paiement */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Informations bancaires et paiement
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="IBAN"
                value={formData.iban || ""}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="BIC"
                value={formData.bic || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bic: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Mode de paiement"
                value={formData.modePaiement || ""}
                onChange={(e) =>
                  setFormData({ ...formData, modePaiement: e.target.value })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Délai de paiement (jours)"
                type="number"
                value={formData.delaiPaiementJours || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delaiPaiementJours: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                InputProps={{ readOnly: isReadOnly }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.refCommandeObligatoire ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        refCommandeObligatoire: e.target.checked,
                      })
                    }
                    disabled={isReadOnly}
                  />
                }
                label="Référence de commande obligatoire"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {globalAttributes.length > 0 && (
        <Accordion sx={{ mt: 2, mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" gutterBottom>
              Attributs Globaux
            </Typography>
          </AccordionSummary>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                {globalAttributes.map((attribute) => (
                  <Grid size={{ xs: 12, md: 6 }} key={attribute.uuid}>
                    {renderAttributeInput(
                      attribute,
                      attributeValues[attribute.code] || "",
                      (value) =>
                        setAttributeValues({
                          ...attributeValues,
                          [attribute.code]: value,
                        }),
                      isReadOnly,
                    )}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Accordion>
      )}

      {!isNew && tiers && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Rôles du tiers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TiersRolesManager
              tiersUuid={tiers.uuid}
              isReadOnly={isReadOnly}
              onRoleChange={() => setAuditRefreshTrigger((prev) => prev + 1)}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {!isNew && tiers && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Sociétés attachées</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box />

              {!isReadOnly &&
                permissions.can(Permission.TIERS_SOCIETE_ATTACH) && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAttachDrawer}
                  >
                    Attacher à une société
                  </Button>
                )}
            </Box>

            {tiers.societes && tiers.societes.length > 0 ? (
              tiers.societes.map((ts) => (
                <Accordion key={ts.uuid}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Typography sx={{ flexGrow: 1 }}>
                        {ts.societe?.raisonSociale} - Code ERP:{" "}
                        {ts.codeTiersErp || "N/A"}
                      </Typography>
                      <Chip
                        label={ts.actif ? "Actif" : "Inactif"}
                        color={ts.actif ? "success" : "default"}
                        size="small"
                        sx={{ mr: 2 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                        <Chip
                          label={
                            ts.fraisGeneraux
                              ? "Frais généraux: Oui"
                              : "Frais généraux: Non"
                          }
                          color={ts.fraisGeneraux ? "primary" : "default"}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={
                            ts.fraisMetier
                              ? "Frais métier: Oui"
                              : "Frais métier: Non"
                          }
                          color={ts.fraisMetier ? "primary" : "default"}
                          size="small"
                          variant="outlined"
                        />
                        {ts.codeAdressagePa && (
                          <Chip
                            label={`Code adressage PA: ${ts.codeAdressagePa}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {ts.codeRoutageAdvEntrant && (
                          <Chip
                            label={`Code routage ADV entrant: ${ts.codeRoutageAdvEntrant}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Attributs personnalisés
                      </Typography>
                      {ts.customAttributes &&
                      Object.keys(ts.customAttributes).length > 0 ? (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Attribut</TableCell>
                              <TableCell>Valeur</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(ts.customAttributes).map(
                              ([code, valeur]) => (
                                <TableRow key={code}>
                                  <TableCell>{code}</TableCell>
                                  <TableCell>{valeur || "-"}</TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography color="text.secondary">
                          Aucun attribut personnalisé
                        </Typography>
                      )}
                      {!isReadOnly && (
                        <Box mt={2} display="flex" gap={1}>
                          {permissions.can(Permission.TIERS_SOCIETE_UPDATE) && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEditDialog(ts)}
                            >
                              Modifier
                            </Button>
                          )}
                          {permissions.can(Permission.TIERS_SOCIETE_DETACH) && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() =>
                                handleOpenDetachDialog(
                                  ts.uuid,
                                  ts.societe?.raisonSociale || "Société",
                                )
                              }
                            >
                              Détacher
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography color="text.secondary">
                Ce tiers n'est attaché à aucune société
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {!isNew && tiers && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Historique des modifications</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TiersAuditHistory
              tiersUuid={tiers.uuid}
              refreshTrigger={auditRefreshTrigger}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Drawer d'attachement à une société */}
      {!isReadOnly && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={attachDrawerOpen}
        onClose={handleCloseAttachDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "500px", md: "600px" },
            p: 0,
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Attacher à une société
            </Typography>
            <IconButton onClick={handleCloseAttachDrawer} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <FormControl fullWidth>
                <InputLabel>Société</InputLabel>
                <Select
                  value={selectedSociete}
                  onChange={(e) => handleSocieteChange(e.target.value)}
                  label="Société"
                  required
                >
                  {societes
                    .filter(
                      (s) =>
                        !tiers?.societes.some(
                          (ts) => ts.societe?.uuid === s.uuid,
                        ),
                    )
                    .map((societe) => (
                      <MenuItem key={societe.uuid} value={societe.uuid}>
                        {societe.raisonSociale}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Code Tiers ERP"
                value={codeTiersErp}
                onChange={(e) => setCodeTiersErp(e.target.value)}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={fraisGeneraux}
                    onChange={(e) => setFraisGeneraux(e.target.checked)}
                  />
                }
                label="Frais généraux"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={fraisMetier}
                    onChange={(e) => setFraisMetier(e.target.checked)}
                  />
                }
                label="Frais métier"
              />

              <TextField
                fullWidth
                label="Code d'adressage PA"
                value={codeAdressagePa}
                onChange={(e) => setCodeAdressagePa(e.target.value)}
              />

              <Autocomplete
                freeSolo
                options={[]}
                value={codeRoutageAdvEntrant}
                onInputChange={(_, newValue) =>
                  setCodeRoutageAdvEntrant(newValue)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Code routage ADV entrant"
                    placeholder="Saisir un code..."
                  />
                )}
                noOptionsText="Aucune suggestion"
              />

              {societeAttributes.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      Attributs de la Société
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                      {societeAttributes.map((attribute) => (
                        <Box key={attribute.uuid}>
                          {renderAttributeInput(
                            attribute,
                            attributeValues[attribute.code] || "",
                            (value) =>
                              setAttributeValues({
                                ...attributeValues,
                                [attribute.code]: value,
                              }),
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleCloseAttachDrawer} variant="outlined">
              Annuler
            </Button>
            <Button
              onClick={handleAttachToSociete}
              variant="contained"
              disabled={!selectedSociete}
            >
              Attacher
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Drawer d'édition de société attachée */}
      <Drawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleCloseEditDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "500px", md: "600px" },
            p: 0,
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Modifier la société attachée
            </Typography>
            <IconButton onClick={handleCloseEditDrawer} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                label="Société"
                value={editingTiersSociete?.societeNom || ""}
                disabled
                helperText="La société ne peut pas être modifiée. Pour changer de société, détachez puis rattachez."
              />

              <TextField
                fullWidth
                label="Code Tiers ERP"
                value={codeTiersErp}
                onChange={(e) => setCodeTiersErp(e.target.value)}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editingTiersSociete?.fraisGeneraux || false}
                    onChange={(e) =>
                      setEditingTiersSociete(
                        editingTiersSociete
                          ? {
                              ...editingTiersSociete,
                              fraisGeneraux: e.target.checked,
                            }
                          : null,
                      )
                    }
                  />
                }
                label="Frais généraux"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editingTiersSociete?.fraisMetier || false}
                    onChange={(e) =>
                      setEditingTiersSociete(
                        editingTiersSociete
                          ? {
                              ...editingTiersSociete,
                              fraisMetier: e.target.checked,
                            }
                          : null,
                      )
                    }
                  />
                }
                label="Frais métier"
              />

              <TextField
                fullWidth
                label="Code d'adressage PA"
                value={editingTiersSociete?.codeAdressagePa || ""}
                onChange={(e) =>
                  setEditingTiersSociete(
                    editingTiersSociete
                      ? {
                          ...editingTiersSociete,
                          codeAdressagePa: e.target.value,
                        }
                      : null,
                  )
                }
              />

              <Autocomplete
                freeSolo
                options={[]}
                value={editingTiersSociete?.codeRoutageAdvEntrant || ""}
                onInputChange={(_, newValue) =>
                  setEditingTiersSociete(
                    editingTiersSociete
                      ? {
                          ...editingTiersSociete,
                          codeRoutageAdvEntrant: newValue,
                        }
                      : null,
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Code routage ADV entrant"
                    placeholder="Saisir un code..."
                  />
                )}
                noOptionsText="Aucune suggestion"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editingTiersSociete?.actif || false}
                    onChange={(e) =>
                      setEditingTiersSociete(
                        editingTiersSociete
                          ? { ...editingTiersSociete, actif: e.target.checked }
                          : null,
                      )
                    }
                  />
                }
                label="Actif"
              />

              {societeAttributes.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      Attributs de la Société
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                      {societeAttributes.map((attribute) => (
                        <Box key={attribute.uuid}>
                          {renderAttributeInput(
                            attribute,
                            attributeValues[attribute.code] || "",
                            (value) =>
                              setAttributeValues({
                                ...attributeValues,
                                [attribute.code]: value,
                              }),
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleCloseEditDrawer} variant="outlined">
              Annuler
            </Button>
            <Button
              onClick={handleUpdateTiersSociete}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Enregistrer
            </Button>
          </Box>
        </Box>
      </Drawer>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDetachDialog}
        onConfirm={handleConfirmDetach}
        title="Confirmer le détachement"
        message="Cette action est irréversible. Pour confirmer le détachement du tiers de la société, veuillez saisir"
        itemName={tiersSocieteToDelete ? tiersSocieteToDelete.nom : ""}
        confirmationText="supprimer"
      />
    </Box>
  );
}
