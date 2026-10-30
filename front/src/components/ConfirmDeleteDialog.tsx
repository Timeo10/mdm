import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  confirmationText?: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  message = 'Cette action est irréversible. Pour confirmer, veuillez saisir',
  itemName,
  confirmationText = 'supprimer',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  const handleConfirm = () => {
    if (inputValue === confirmationText) {
      setInputValue('');
      onConfirm();
    }
  };

  const isConfirmDisabled = inputValue !== confirmationText;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="error" />
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            {message} <strong>"{confirmationText}"</strong>
            {itemName && (
              <>
                {' '}
                pour supprimer <strong>{itemName}</strong>
              </>
            )}
            .
          </Typography>
        </Box>
        <TextField
          autoFocus
          fullWidth
          label={`Saisir "${confirmationText}"`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          variant="outlined"
          error={inputValue !== '' && inputValue !== confirmationText}
          helperText={
            inputValue !== '' && inputValue !== confirmationText
              ? `Vous devez saisir exactement "${confirmationText}"`
              : ''
          }
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isConfirmDisabled) {
              handleConfirm();
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isConfirmDisabled}
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
