import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FileUpload as FileUploadIcon,
  SkipNext as SkipNextIcon,
} from '@mui/icons-material';

export interface TiersImportRecapState {
  fileName: string;
  totalRows: number;
  imported: number;
  excludedRows: Array<{
    line: number;
    reason: string;
    raisonSociale?: string;
  }>;
  errorRows: Array<{
    line: number;
    message: string;
    raisonSociale?: string;
  }>;
  importedAt: string;
}

export default function TiersImportRecap() {
  const location = useLocation();
  const navigate = useNavigate();
  const recap = location.state as TiersImportRecapState | null;

  const status = useMemo(() => {
    if (!recap) return 'missing';
    if (recap.errorRows.length > 0) return 'warning';
    if (recap.excludedRows.length > 0) return 'partial';
    return 'success';
  }, [recap]);

  if (!recap) {
    return (
      <Box p={3}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucun récapitulatif d'import n'est disponible.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tiers')}
        >
          Retour aux tiers
        </Button>
      </Box>
    );
  }

  const totalExcluded = recap.excludedRows.length;
  const totalErrors = recap.errorRows.length;
  const errorSummary = Object.entries(
    recap.errorRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.message] = (acc[row.message] || 0) + 1;
      return acc;
    }, {})
  ).sort(([, countA], [, countB]) => countB - countA);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Récapitulatif d'import
          </Typography>
          <Typography color="text.secondary">
            {recap.fileName} - {new Date(recap.importedAt).toLocaleString('fr-FR')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tiers')}
        >
          Retour aux tiers
        </Button>
      </Box>

      {status === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Import terminé avec succès.
        </Alert>
      )}
      {status === 'partial' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Import terminé avec des lignes exclues.
        </Alert>
      )}
      {status === 'warning' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Import terminé avec des erreurs sur certaines lignes.
        </Alert>
      )}

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <FileUploadIcon color="primary" />
                <Typography variant="subtitle2">Lignes lues</Typography>
              </Box>
              <Typography variant="h4">{recap.totalRows}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CheckCircleIcon color="success" />
                <Typography variant="subtitle2">Importées</Typography>
              </Box>
              <Typography variant="h4">{recap.imported}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <SkipNextIcon color="warning" />
                <Typography variant="subtitle2">Exclues</Typography>
              </Box>
              <Typography variant="h4">{totalExcluded}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ErrorIcon color="error" />
                <Typography variant="subtitle2">Erreurs</Typography>
              </Box>
              <Typography variant="h4">{totalErrors}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {errorSummary.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Synthèse des erreurs
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Erreur</TableCell>
                    <TableCell align="right">Nombre de lignes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errorSummary.map(([message, count]) => (
                    <TableRow key={message}>
                      <TableCell>{message}</TableCell>
                      <TableCell align="right">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {(totalExcluded > 0 || totalErrors > 0) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Détail des lignes non importées
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ligne</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Nom tiers</TableCell>
                    <TableCell>Détail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recap.excludedRows.map((row) => (
                    <TableRow key={`excluded-${row.line}`}>
                      <TableCell>{row.line}</TableCell>
                      <TableCell>
                        <Chip label="Exclue" color="warning" size="small" />
                      </TableCell>
                      <TableCell>{row.raisonSociale || '-'}</TableCell>
                      <TableCell>{row.reason}</TableCell>
                    </TableRow>
                  ))}
                  {recap.errorRows.map((row) => (
                    <TableRow key={`error-${row.line}`}>
                      <TableCell>{row.line}</TableCell>
                      <TableCell>
                        <Chip label="Erreur" color="error" size="small" />
                      </TableCell>
                      <TableCell>{row.raisonSociale || '-'}</TableCell>
                      <TableCell>{row.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
