import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  AlertTitle,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { TierPendingApproval, Tiers, CustomAttribute } from '../../types';
import { User } from '../../services/AuthApi';

interface ApprovalDialogProps {
  open: boolean;
  tier: TierPendingApproval | null;
  currentUser: User | null;
  editableTierData: Partial<Tiers>;
  customAttributes: CustomAttribute[];
  globalAttributeValues: Record<string, string | null>;
  onEditableTierDataChange: (data: Partial<Tiers>) => void;
  onGlobalAttributeValuesChange: (values: Record<string, string | null>) => void;
  onClose: () => void;
  onApprove: () => void;
}

export default function ApprovalDialog({
  open,
  tier,
  currentUser,
  editableTierData,
  customAttributes,
  globalAttributeValues,
  onEditableTierDataChange,
  onGlobalAttributeValuesChange,
  onClose,
  onApprove,
}: ApprovalDialogProps) {
  const setEditableTierData = onEditableTierDataChange;
  const setGlobalAttributeValues = onGlobalAttributeValuesChange;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ApproveIcon color="success" />
          Approuver et finaliser le tiers
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Modification avant approbation</AlertTitle>
            Vous pouvez modifier les informations du tiers et renseigner les attributs personnalisés avant d'approuver.
            {currentUser && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Approuvé par: <strong>{currentUser.email}</strong>
              </Typography>
            )}
          </Alert>

          {/* Informations de base */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Informations générales</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Raison sociale"
                    value={editableTierData.raisonSociale || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, raisonSociale: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nom commercial"
                    value={editableTierData.nomCommercial || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, nomCommercial: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Type de tiers"
                    value={editableTierData.typeTiers || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, typeTiers: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="SIREN"
                    value={editableTierData.siren || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, siren: e.target.value })}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 9 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="SIRET"
                    value={editableTierData.siret || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, siret: e.target.value })}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 14 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Forme juridique"
                    value={editableTierData.formeJuridique || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, formeJuridique: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Type d'entreprise"
                    value={editableTierData.typeEntreprise || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, typeEntreprise: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Capital social"
                    value={editableTierData.capitalSocial || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, capitalSocial: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Adresse */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Adresse</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Adresse ligne 1"
                    value={editableTierData.adresseLigne1 || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, adresseLigne1: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Adresse ligne 2"
                    value={editableTierData.adresseLigne2 || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, adresseLigne2: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Adresse ligne 3"
                    value={editableTierData.adresseLigne3 || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, adresseLigne3: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Code postal"
                    value={editableTierData.codePostal || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, codePostal: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Ville"
                    value={editableTierData.ville || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, ville: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Région"
                    value={editableTierData.region || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, region: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="CEDEX"
                    value={editableTierData.cedex || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, cedex: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Pays (ISO)"
                    value={editableTierData.paysIso || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, paysIso: e.target.value })}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 2 }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Contact et Finance */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Contact et informations bancaires</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Email facturation"
                    type="email"
                    value={editableTierData.emailFacturation || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, emailFacturation: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="IBAN"
                    value={editableTierData.iban || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, iban: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="BIC"
                    value={editableTierData.bic || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, bic: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Mode de paiement"
                    value={editableTierData.modePaiement || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, modePaiement: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Délai de paiement (jours)"
                    type="number"
                    value={editableTierData.delaiPaiementJours || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, delaiPaiementJours: parseInt(e.target.value) || undefined })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Code TVA intracommunautaire"
                    value={editableTierData.codeTvaIntracom || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, codeTvaIntracom: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Régime TVA"
                    value={editableTierData.regimeTva || ''}
                    onChange={(e) => setEditableTierData({ ...editableTierData, regimeTva: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editableTierData.refCommandeObligatoire || false}
                        onChange={(e) => setEditableTierData({ ...editableTierData, refCommandeObligatoire: e.target.checked })}
                      />
                    }
                    label="Référence commande obligatoire"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Attributs personnalisés */}
          {customAttributes.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Attributs personnalisés</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {customAttributes.map((attr) => (
                    <Grid size={{ xs: 12, md: 6 }} key={attr.uuid}>
                      <TextField
                        label={attr.libelle}
                        value={globalAttributeValues[attr.uuid] || ''}
                        onChange={(e) => setGlobalAttributeValues({ ...globalAttributeValues, [attr.uuid]: e.target.value })}
                        fullWidth
                        size="small"
                        required={attr.obligatoire}
                        helperText={attr.description}
                        type={
                          attr.typeChamp === 'nombre' ? 'number' :
                          attr.typeChamp === 'email' ? 'email' :
                          attr.typeChamp === 'url' ? 'url' :
                          attr.typeChamp === 'date' ? 'date' :
                          'text'
                        }
                        InputLabelProps={attr.typeChamp === 'date' ? { shrink: true } : undefined}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={onApprove}
          variant="contained"
          color="success"
          disabled={!currentUser}
          startIcon={<ApproveIcon />}
        >
          Approuver
        </Button>
      </DialogActions>
    </Dialog>
  );
}
