import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TiersApi } from '../../services/TiersApi';
import { SocieteApi } from '../../services/SocieteApi';
import { CreateTiersDto, Tiers } from '../../types';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import TiersGatewayDialog, { TiersGatewayData } from '../../components/TiersGatewayDialog';
import { useContext } from 'react';
import { SnackbarContext } from '../../providers/SnackBarProvider';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/permissions';
import { formatSiren } from '../../utils/formatters';
import { TiersImportRecapState } from './TiersImportRecap';

export default function TiersList() {
  const snackBarProvider = useContext(SnackbarContext);
  const permissions = usePermissions();
  const [tiers, setTiers] = useState<Tiers[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<Tiers | null>(null);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const normalizeHeader = (value: string) =>
    value
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const detectDelimiter = (line: string) => {
    const delimiters = [';', ',', '\t'];
    return delimiters.reduce((best, delimiter) => {
      const count = line.split(delimiter).length;
      return count > line.split(best).length ? delimiter : best;
    }, ';');
  };

  const parseCsvLine = (line: string, delimiter: string) => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && nextChar === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const parseCsv = (content: string) => {
    const lines = content
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      return [];
    }

    const delimiter = detectDelimiter(lines[0]);
    const headers = parseCsvLine(lines[0], delimiter).map(normalizeHeader);

    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line, delimiter);
      return headers.reduce<Record<string, string>>((row, header, index) => {
        row[header] = values[index]?.trim() || '';
        return row;
      }, {});
    });
  };

  const csvValue = (row: Record<string, string>, aliases: string[]) => {
    for (const alias of aliases) {
      const value = row[normalizeHeader(alias)];
      if (value) return value.trim();
    }
    return '';
  };

  const normalizeCountryCode = (value: string) => {
    const normalized = value.trim().toUpperCase();
    if (!normalized) return '';
    if (normalized === 'FRANCE' || normalized === 'FRA') return 'FR';
    return normalized.slice(0, 2);
  };

  const normalizeDigits = (value: string) => value.replace(/\D/g, '');

  const normalizeLookupValue = (value: string) =>
    value
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

  const societeImportAliases: Record<string, string> = {
    DEHOSSE: 'ALBERT & PAUL DEHOSSE',
    CHAIHDF: 'Chai des Hauts de France',
    VIGNESHDF: 'VIGNES DES HAUTS DE France',
    LESBROUCKS: 'SCI Les Broucks',
    ADVITAMAGROEQUIPEMENT: 'ADVITAM Agroequipement',
    ADVITAMNEGOCE: 'ADVITAM Negoce',
    ADVITAMIMMOBILIERE: 'ADVITAM Immobilière',
    ADVITAMDISTRIBUTION: 'ADVITAM Distribution',
    ADVITAMPARTICIPATIONS: 'ADVITAM Participations',
  };

  const mapCsvRowToTypeTiers = (row: Record<string, string>) =>
    csvValue(row, ['Client']) ? 'Client' : 'Fournisseur';

  const mapCsvRowToTiers = (row: Record<string, string>): CreateTiersDto => ({
    actif: true,
    typeTiers: mapCsvRowToTypeTiers(row),
    raisonSociale: csvValue(row, ['Nom Tiers']),
    adresseLigne1: csvValue(row, ['Adresse Tiers']),
    adresseLigne2: csvValue(row, ['Adresse 2 Tier', 'Adresse 2 Tiers']),
    codePostal: csvValue(row, ['Code Postal T', 'Code Postal Tiers']),
    ville: csvValue(row, ['Ville Tiers']),
    paysIso: normalizeCountryCode(csvValue(row, ['Pays Tiers'])),
    codeTvaIntracom: csvValue(row, ['Code TVA Intr', 'Code TVA Intracom']),
    siret: normalizeDigits(csvValue(row, ['SIRET'])),
    siren: normalizeDigits(csvValue(row, ['siren', 'SIREN'])),
  });

  const getCsvSocieteCode = (row: Record<string, string>) =>
    csvValue(row, ['Code Societe', 'Code Société']);

  const getCsvCodeTiersErp = (row: Record<string, string>) =>
    csvValue(row, ['Code Tiers So', 'Code Tiers Societe', 'Code Tiers Société']);

  const isConflictError = (error: unknown) =>
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 409;

  const getImportErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      if (response?.data?.message) {
        return response.data.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Erreur inconnue lors de l\'import';
  };

  const handleCsvImportClick = () => {
    csvInputRef.current?.click();
  };

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      setImportingCsv(true);
      const content = await file.text();
      const rows = parseCsv(content);
      const societes = await SocieteApi.getAll(true);
      const societesByCode = new Map<string, (typeof societes)[number]>();
      societes.forEach((societe) => {
        societesByCode.set(normalizeLookupValue(societe.code), societe);
        societesByCode.set(normalizeLookupValue(societe.raisonSociale), societe);
      });
      let imported = 0;
      const excludedRows: TiersImportRecapState['excludedRows'] = [];
      const errorRows: TiersImportRecapState['errorRows'] = [];

      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const data = mapCsvRowToTiers(row);
        const societeCode = getCsvSocieteCode(row) || csvValue(row, ['Code filiale']);
        const normalizedSocieteCode = normalizeLookupValue(societeCode);
        const societe =
          societesByCode.get(normalizedSocieteCode) ||
          societesByCode.get(normalizeLookupValue(societeImportAliases[normalizedSocieteCode] || ''));

        if (!data.siret) {
          excludedRows.push({
            line: index + 2,
            reason: 'SIRET absent',
            raisonSociale: data.raisonSociale,
          });
          continue;
        }

        try {
          const tiers = await TiersApi.create(data, { silentErrors: true });

          if (societe) {
            try {
              await TiersApi.attachToSociete(
                {
                  tiersUuid: tiers.uuid,
                  societeUuid: societe.uuid,
                  codeTiersErp: getCsvCodeTiersErp(row) || undefined,
                  actif: true,
                },
                { silentErrors: true }
              );
            } catch (attachError) {
              if (!isConflictError(attachError)) {
                throw attachError;
              }
            }
          }

          imported += 1;
        } catch (error) {
          console.error(`Erreur import CSV ligne ${index + 2}:`, error);
          errorRows.push({
            line: index + 2,
            message: getImportErrorMessage(error),
            raisonSociale: data.raisonSociale,
          });
        }
      }

      navigate('/tiers/import-recap', {
        state: {
          fileName: file.name,
          totalRows: rows.length,
          imported,
          excludedRows,
          errorRows,
          importedAt: new Date().toISOString(),
        } satisfies TiersImportRecapState,
      });
    } catch (error) {
      console.error('Erreur d\'import CSV:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de l\'import CSV', 'error');
    } finally {
      setImportingCsv(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadTiers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await TiersApi.getAll({
        page: page + 1, // API uses 1-based pages
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        includeInactive,
      });
      setTiers(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Erreur de chargement des tiers:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors du chargement des tiers', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, includeInactive, snackBarProvider]);

  useEffect(() => {
    loadTiers();
  }, [loadTiers]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, includeInactive]);

  const handleOpenDeleteDialog = (tier: Tiers) => {
    setTierToDelete(tier);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTierToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!tierToDelete) return;

    try {
      await TiersApi.delete(tierToDelete.uuid);
      handleCloseDeleteDialog();
      loadTiers();
      snackBarProvider?.showSnackbarMessage('Tiers supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur de suppression:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de la suppression', 'error');
    }
  };

  const handleOpenGatewayDialog = () => {
    setGatewayDialogOpen(true);
  };

  const handleCloseGatewayDialog = () => {
    setGatewayDialogOpen(false);
  };

  const handleCreateNewTiers = (initialData: TiersGatewayData) => {
    navigate('/tiers/new', { state: initialData });
  };

  const handleSelectExistingTiers = (tiers: Tiers) => {
    navigate(`/tiers/${tiers.uuid}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleIncludeInactiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(e.target.checked);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Gestion des Tiers
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={handleIncludeInactiveChange}
              />
            }
            label="Afficher les inactifs"
          />
          {permissions.can(Permission.TIERS_CREATE) && (
            <>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={handleCsvImport}
              />
              <Button
                variant="outlined"
                startIcon={
                  importingCsv ? (
                    <CircularProgress size={18} />
                  ) : (
                    <FileUploadIcon />
                  )
                }
                onClick={handleCsvImportClick}
                disabled={importingCsv}
              >
                {importingCsv ? 'Import en cours...' : 'Importer CSV'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenGatewayDialog}
              >
                Nouveau Tiers
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder="Rechercher par code MDM, nom, SIREN, SIRET, raison sociale ou type..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code tiers MDM</TableCell>
                  <TableCell>SIREN</TableCell>
                  <TableCell>SIRET</TableCell>
                  <TableCell>Raison sociale</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : tiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        {searchTerm ? 'Aucun tiers ne correspond à votre recherche' : 'Aucun tiers trouvé'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tiers.map((tier) => (
                    <TableRow key={tier.uuid} hover>
                      <TableCell>{tier.codeTiersMdm || '-'}</TableCell>
                      <TableCell>{formatSiren(tier.siren) || '-'}</TableCell>
                      <TableCell>{tier.siret || '-'}</TableCell>
                      <TableCell>{tier.raisonSociale || '-'}</TableCell>
                      <TableCell>{tier.typeTiers || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={tier.actif ? 'Actif' : 'Inactif'}
                          color={tier.actif ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/tiers/${tier.uuid}?mode=view`)}
                          title="Consulter"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {permissions.can(Permission.TIERS_UPDATE) && (
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tiers/${tier.uuid}`)}
                            title="Éditer"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {permissions.can(Permission.TIERS_DELETE) && (
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(tier)}
                            color="error"
                            title="Supprimer"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
          />
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression du tiers"
        message="Cette action est irréversible. Pour confirmer la suppression, veuillez saisir"
        itemName={tierToDelete ? `${tierToDelete.raisonSociale || '-'} (${tierToDelete.siren || 'N/A'})` : ''}
        confirmationText="supprimer"
      />

      <TiersGatewayDialog
        open={gatewayDialogOpen}
        onClose={handleCloseGatewayDialog}
        onCreateNew={handleCreateNewTiers}
        onSelectExisting={handleSelectExistingTiers}
      />
    </Box>
  );
}
