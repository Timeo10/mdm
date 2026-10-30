import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TiersContactManager from './TiersContactManager';
import { CreateTiersDto, Societe } from '../types';

interface TiersCoordonneesSectionProps {
  formData: CreateTiersDto;
  setFormData: (data: CreateTiersDto) => void;
  isReadOnly: boolean;
  tiersUuid: string | null;
  isNew: boolean;
  societes: Societe[];
}

const TiersCoordonneesSection: React.FC<TiersCoordonneesSectionProps> = ({
  formData,
  setFormData,
  isReadOnly,
  tiersUuid,
  isNew,
  societes,
}) => {
  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Coordonnées et contact</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {!isNew && tiersUuid && (
          <>
            <TiersContactManager
              tiersUuid={tiersUuid}
              isReadOnly={isReadOnly}
              societes={societes}
            />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default TiersCoordonneesSection;
