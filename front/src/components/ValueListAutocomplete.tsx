import { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { ValueListApi } from '../services/ValueListApi';
import { ValueListItem } from '../types';

interface ValueListAutocompleteProps {
  listCode: string;
  value: string | null;
  onChange: (code: string | null) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  readOnly?: boolean;
}

export default function ValueListAutocomplete({
  listCode,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText,
  readOnly = false,
}: ValueListAutocompleteProps) {
  const [items, setItems] = useState<ValueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadItems();
  }, [listCode]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const valueList = await ValueListApi.getByCode(listCode);
      setItems(valueList.items?.filter(item => item.actif) || []);
    } catch (error) {
      console.error(`Erreur de chargement de la liste ${listCode}:`, error);
      setLoadError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find(item => item.code === value) || null;

  return (
    <Autocomplete
      value={selectedItem}
      onChange={(_event, newValue) => {
        onChange(newValue ? newValue.code : null);
      }}
      options={items}
      getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      loading={loading}
      disabled={disabled || loadError}
      readOnly={readOnly}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error || loadError}
          helperText={loadError ? 'Erreur de chargement de la liste' : helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
