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
} from '@mui/material';
import { Cancel as RejectIcon } from '@mui/icons-material';
import { TierPendingApproval } from '../../types';
import { User } from '../../services/AuthApi';

interface RejectDialogProps {
  open: boolean;
  tier: TierPendingApproval | null;
  currentUser: User | null;
  reviewComment: string;
  onCommentChange: (comment: string) => void;
  onClose: () => void;
  onReject: () => void;
}

export default function RejectDialog({
  open,
  tier,
  currentUser,
  reviewComment,
  onCommentChange,
  onClose,
  onReject,
}: RejectDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <RejectIcon color="error" />
          Rejeter le tiers
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="warning">
            <AlertTitle>Attention</AlertTitle>
            Le rejet d'un tiers nécessite un commentaire expliquant la raison du refus.
          </Alert>
          {currentUser && (
            <Typography variant="body2" color="text.secondary">
              Rejeté par: <strong>{currentUser.email}</strong>
            </Typography>
          )}
          {tier && (
            <Alert severity="info">
              <AlertTitle>{tier.raisonSociale || '-'}</AlertTitle>
              SIREN: {tier.siren || '-'} | SIRET: {tier.siret || '-'}
            </Alert>
          )}
          <TextField
            label="Motif du rejet"
            value={reviewComment}
            onChange={(e) => onCommentChange(e.target.value)}
            multiline
            rows={4}
            required
            fullWidth
            helperText="Minimum 10 caractères"
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={onReject}
          variant="contained"
          color="error"
          disabled={!currentUser || reviewComment.trim().length < 10}
          startIcon={<RejectIcon />}
        >
          Rejeter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
