import { useState } from 'react';
import {
  Popover,
  Box,
  TextField,
  Button,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';

interface ColumnFilterMenuProps {
  field: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  uniqueValues: string[];
  selectedValues: string[];
  onToggleValue: (value: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export default function ColumnFilterMenu({
  anchorEl,
  onClose,
  uniqueValues,
  selectedValues,
  onToggleValue,
  onSelectAll,
  onClearAll,
}: ColumnFilterMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  const filteredValues = uniqueValues.filter((value) =>
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = selectedValues.length === 0;
  const noneSelected = selectedValues.length === 1 && selectedValues[0] === '__NONE__';

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          autoFocus
        />

        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onSelectAll}
            disabled={allSelected}
          >
            Tout sélectionner
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={onClearAll}
            disabled={noneSelected}
          >
            Tout désélectionner
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          <FormGroup>
            {filteredValues.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Aucun résultat
              </Typography>
            ) : (
              filteredValues.map((value) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={
                        selectedValues.length === 0 ||
                        (selectedValues.includes(value) && selectedValues[0] !== '__NONE__')
                      }
                      onChange={() => onToggleValue(value)}
                      size="small"
                    />
                  }
                  label={value || '(vide)'}
                />
              ))
            )}
          </FormGroup>
        </Box>
      </Box>
    </Popover>
  );
}
