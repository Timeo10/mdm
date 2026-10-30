import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  List,
  ListItemText,
  ListItemButton,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { TiersApi } from '../services/TiersApi';
import { Tiers } from '../types';

interface TiersGatewayDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateNew: (initialData: TiersGatewayData) => void;
  onSelectExisting: (tiers: Tiers) => void;
}

export interface TiersGatewayData {
  siren?: string;
  siret?: string;
  raisonSociale?: string;
}

const TiersGatewayDialog: React.FC<TiersGatewayDialogProps> = ({
  open,
  onClose,
  onCreateNew,
  onSelectExisting,
}) => {
  const [formData, setFormData] = useState<TiersGatewayData>({
    siren: '',
    siret: '',
    raisonSociale: '',
  });
  const [searching, setSearching] = useState(false);
  const [similarTiers, setSimilarTiers] = useState<Tiers[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        siren: '',
        siret: '',
        raisonSociale: '',
      });
      setSimilarTiers([]);
      setHasSearched(false);
    }
  }, [open]);

  const handleSearch = async () => {
    const { siren, siret, raisonSociale } = formData;

    // Au moins un critère doit être renseigné
    if (!siren && !siret && !raisonSociale) {
      return;
    }

    try {
      setSearching(true);
      const results = await TiersApi.searchSimilar({
        siren: siren || undefined,
        siret: siret || undefined,
        raisonSociale: raisonSociale || undefined,
      });
      setSimilarTiers(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSimilarTiers([]);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateNew = () => {
    onCreateNew(formData);
  };

  const handleSelectTiers = (tiers: Tiers) => {
    onSelectExisting(tiers);
  };

  const canSearch = formData.siren || formData.siret || formData.raisonSociale;
  const hasDuplicates = similarTiers.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '600px',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SearchIcon color="primary" />
          <Typography variant="h6" component="span">
            Sas d'entrée - Nouveau Tiers
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Détection de doublons</AlertTitle>
            Veuillez renseigner au moins un critère pour vérifier si ce tiers n'existe pas déjà dans le système.
          </Alert>

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Critères de recherche
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Raison sociale"
                value={formData.raisonSociale}
                onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && canSearch) {
                    handleSearch();
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SIREN"
                value={formData.siren}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setFormData({ ...formData, siren: value });
                }}
                inputProps={{ maxLength: 9 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && canSearch) {
                    handleSearch();
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SIRET"
                value={formData.siret}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                  setFormData({ ...formData, siret: value });
                }}
                inputProps={{ maxLength: 14 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && canSearch) {
                    handleSearch();
                  }
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={!canSearch || searching}
            >
              {searching ? 'Recherche en cours...' : 'Rechercher'}
            </Button>
          </Box>
        </Box>

        {hasSearched && (
          <>
            <Divider sx={{ my: 3 }} />

            {hasDuplicates ? (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WarningIcon />
                      {similarTiers.length} tiers similaire{similarTiers.length > 1 ? 's' : ''} trouvé{similarTiers.length > 1 ? 's' : ''}
                    </Box>
                  </AlertTitle>
                  Des tiers existants correspondent à vos critères. Vérifiez s'il s'agit du même tiers avant de créer un doublon.
                </Alert>

                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Tiers existants
                </Typography>

                <List>
                  {similarTiers.map((tiers, index) => (
                    <React.Fragment key={tiers.uuid}>
                      <ListItemButton
                        onClick={() => handleSelectTiers(tiers)}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {tiers.raisonSociale || 'Sans nom'}
                              </Typography>
                              {tiers.actif ? (
                                <Chip label="Actif" color="success" size="small" />
                              ) : (
                                <Chip label="Inactif" color="default" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {tiers.raisonSociale && (
                                <Typography variant="body2" color="text.secondary">
                                  Raison sociale: {tiers.raisonSociale}
                                </Typography>
                              )}
                              {tiers.siren && (
                                <Typography variant="body2" color="text.secondary">
                                  SIREN: {tiers.siren}
                                </Typography>
                              )}
                              {tiers.siret && (
                                <Typography variant="body2" color="text.secondary">
                                  SIRET: {tiers.siret}
                                </Typography>
                              )}
                              {tiers.typeTiers && (
                                <Typography variant="body2" color="text.secondary">
                                  Type: {tiers.typeTiers}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LinkIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTiers(tiers);
                          }}
                        >
                          Utiliser ce tiers
                        </Button>
                      </ListItemButton>
                      {index < similarTiers.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ) : (
              <Alert severity="success">
                <AlertTitle>Aucun doublon détecté</AlertTitle>
                Aucun tiers similaire n'a été trouvé. Vous pouvez créer un nouveau tiers.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleCreateNew}
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!hasSearched}
          color={hasDuplicates ? 'warning' : 'primary'}
        >
          {hasDuplicates ? 'Créer malgré tout' : 'Créer un nouveau tiers'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TiersGatewayDialog;
