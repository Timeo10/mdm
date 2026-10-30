import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { TierPendingApproval, ApprovalStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

interface TierDetailDialogProps {
  open: boolean;
  tier: TierPendingApproval | null;
  onClose: () => void;
}

export default function TierDetailDialog({ open, tier, onClose }: TierDetailDialogProps) {
  const navigate = useNavigate();

  if (!tier) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Détails du tiers en attente</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Raison sociale
              </Typography>
              <Typography variant="body1">{tier.raisonSociale || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                SIREN
              </Typography>
              <Typography variant="body1">{tier.siren || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                SIRET
              </Typography>
              <Typography variant="body1">{tier.siret || '-'}</Typography>
            </Grid>
          </Grid>

          {tier.submissionComment && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Commentaire de soumission</AlertTitle>
              {tier.submissionComment}
            </Alert>
          )}

          {tier.potentialDuplicates && tier.potentialDuplicates.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Doublons potentiels détectés</AlertTitle>
              <List dense>
                {tier.potentialDuplicates.map((dup) => (
                  <ListItem key={dup.uuid}>
                    <ListItemText
                      primary={`${dup.raisonSociale || 'Sans nom'} (${dup.siren || 'N/A'})`}
                      secondary={`Score de similarité: ${dup.matchScore}%`}
                    />
                    <Button size="small" onClick={() => navigate(`/tiers/${dup.uuid}`)}>
                      Voir
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {tier.reviewComment && (
            <Alert severity={tier.status === ApprovalStatus.APPROVED ? 'success' : 'error'} sx={{ mt: 2 }}>
              <AlertTitle>
                Commentaire de {tier.status === ApprovalStatus.APPROVED ? 'validation' : 'rejet'}
              </AlertTitle>
              {tier.reviewComment}
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Par {tier.reviewedBy} le{' '}
                {tier.reviewedAt && new Date(tier.reviewedAt).toLocaleString('fr-FR')}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
