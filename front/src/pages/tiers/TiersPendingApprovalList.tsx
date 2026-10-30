import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  TablePagination,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { TierPendingApprovalApi } from '../../services/TierPendingApprovalApi';
import { TierPendingApproval, ApprovalStatus, Tiers, CustomAttribute } from '../../types';
import { SnackbarContext } from '../../providers/SnackBarProvider';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import AuthApi, { User } from '../../services/AuthApi';
import { CustomAttributeApi } from '../../services/CustomAttributeApi';
import StatisticsCards from '../../components/TiersPendingApproval/StatisticsCards';
import TierDetailDialog from '../../components/TiersPendingApproval/TierDetailDialog';
import ApprovalDialog from '../../components/TiersPendingApproval/ApprovalDialog';
import RejectDialog from '../../components/TiersPendingApproval/RejectDialog';
import ColumnFilterMenu from '../../components/ColumnFilterMenu';
import { useNavigate } from 'react-router-dom';

export default function TiersPendingApprovalList() {
  const snackBarProvider = useContext(SnackbarContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingTiers, setPendingTiers] = useState<TierPendingApproval[]>([]);
  const [currentTab, setCurrentTab] = useState<ApprovalStatus>(ApprovalStatus.PENDING);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierPendingApproval | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<{
    raisonSociale: string[];
    siren: string[];
    source: string[];
    submittedBy: string[];
  }>({
    raisonSociale: [],
    siren: [],
    source: [],
    submittedBy: [],
  });
  const [filterAnchors, setFilterAnchors] = useState<{
    raisonSociale: HTMLElement | null;
    siren: HTMLElement | null;
    source: HTMLElement | null;
    submittedBy: HTMLElement | null;
  }>({
    raisonSociale: null,
    siren: null,
    source: null,
    submittedBy: null,
  });
  const [statistics, setStatistics] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [editableTierData, setEditableTierData] = useState<Partial<Tiers>>({});
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);
  const [globalAttributeValues, setGlobalAttributeValues] = useState<Record<string, string | null>>({});

  useEffect(() => {
    loadData();
    loadStatistics();
    loadCurrentUser();
  }, [currentTab]);

  const loadCurrentUser = async () => {
    try {
      const response = await AuthApi.getMe();
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Erreur de chargement utilisateur:', error);
      setCurrentUser({ email: 'user@advitam.fr' });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await TierPendingApprovalApi.getAll(currentTab);
      setPendingTiers(data);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await TierPendingApprovalApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erreur de chargement des statistiques:', error);
    }
  };

  const handleOpenDetailDialog = (tier: TierPendingApproval) => {
    setSelectedTier(tier);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedTier(null);
  };

  const handleOpenApproveDialog = async (tier: TierPendingApproval) => {
    setSelectedTier(tier);

    // Initialiser les données éditables avec les données du tiers en attente
    setEditableTierData({
      typeTiers: tier.typeTiers,
      siren: tier.siren,
      siret: tier.siret,
      raisonSociale: tier.raisonSociale,
      nomCommercial: tier.nomCommercial,
      formeJuridique: tier.formeJuridique,
      typeEntreprise: tier.typeEntreprise,
      capitalSocial: tier.capitalSocial,
      nomPrenom: tier.nomPrenom,
      villeRegistre: tier.villeRegistre,
      dateImmatriculation: tier.dateImmatriculation,
      codeTvaIntracom: tier.codeTvaIntracom,
      regimeTva: tier.regimeTva,
      paysIso: tier.paysIso,
      natureAdresse: tier.natureAdresse,
      adresseLigne1: tier.adresseLigne1,
      adresseLigne2: tier.adresseLigne2,
      adresseLigne3: tier.adresseLigne3,
      cedex: tier.cedex,
      codePostal: tier.codePostal,
      ville: tier.ville,
      region: tier.region,
      emailFacturation: tier.emailFacturation,
      iban: tier.iban,
      bic: tier.bic,
      modePaiement: tier.modePaiement,
      delaiPaiementJours: tier.delaiPaiementJours,
      refCommandeObligatoire: tier.refCommandeObligatoire,
      actif: tier.actif,
    });

    // Charger les attributs personnalisés globaux
    try {
      const attrs = await CustomAttributeApi.getAll();
      const globalAttrs = attrs.filter(attr => attr.portee === 'global' && attr.actif);
      setCustomAttributes(globalAttrs);

      // Initialiser les valeurs des attributs personnalisés
      const initialValues: Record<string, string | null> = {};
      globalAttrs.forEach(attr => {
        initialValues[attr.uuid] = attr.valeurParDefaut || null;
      });
      setGlobalAttributeValues(initialValues);
    } catch (error) {
      console.error('Erreur lors du chargement des attributs personnalisés:', error);
    }

    setApproveDialogOpen(true);
  };

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedTier(null);
    setEditableTierData({});
    setCustomAttributes([]);
    setGlobalAttributeValues({});
  };

  const handleOpenRejectDialog = (tier: TierPendingApproval) => {
    setSelectedTier(tier);
    setReviewComment('');
    setRejectDialogOpen(true);
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedTier(null);
    setReviewComment('');
  };

  const handleOpenDeleteDialog = (tier: TierPendingApproval) => {
    setSelectedTier(tier);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedTier(null);
  };

  const handleApprove = async () => {
    if (!selectedTier || !currentUser) return;

    try {
      await TierPendingApprovalApi.approve(selectedTier.uuid, {
        reviewedBy: currentUser.email,
        modifiedData: editableTierData,
        globalAttributes: globalAttributeValues,
      });
      snackBarProvider?.showSnackbarMessage('Tiers approuvé avec succès', 'success');
      handleCloseApproveDialog();
      loadData();
      loadStatistics();
    } catch (error: any) {
      console.error('Erreur d\'approbation:', error);

      // Afficher le message d'erreur détaillé du serveur (ex: doublon détecté)
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'approbation';
      snackBarProvider?.showSnackbarMessage(errorMessage, 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedTier || !currentUser || !reviewComment.trim()) return;

    try {
      await TierPendingApprovalApi.reject(selectedTier.uuid, {
        reviewedBy: currentUser.email,
        reviewComment,
      });
      snackBarProvider?.showSnackbarMessage('Tiers rejeté', 'info');
      handleCloseRejectDialog();
      loadData();
      loadStatistics();
    } catch (error) {
      console.error('Erreur de rejet:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors du rejet', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTier) return;

    try {
      await TierPendingApprovalApi.delete(selectedTier.uuid);
      snackBarProvider?.showSnackbarMessage('Tiers en attente supprimé', 'success');
      handleCloseDeleteDialog();
      loadData();
      loadStatistics();
    } catch (error) {
      console.error('Erreur de suppression:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de la suppression', 'error');
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenFilter = (field: keyof typeof filters, event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchors((prev) => ({ ...prev, [field]: event.currentTarget }));
  };

  const handleCloseFilter = (field: keyof typeof filters) => {
    setFilterAnchors((prev) => ({ ...prev, [field]: null }));
  };

  const handleToggleFilterValue = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[field];

      // Si on est dans l'état "rien sélectionné" (__NONE__), on commence une nouvelle sélection
      if (currentValues.length === 1 && currentValues[0] === '__NONE__') {
        return { ...prev, [field]: [value] };
      }

      // Si tout est sélectionné (tableau vide), on désélectionne tout sauf la valeur cliquée
      if (currentValues.length === 0) {
        const uniqueValues = getUniqueValues(field);
        const newValues = uniqueValues.filter((v) => v !== value);
        return { ...prev, [field]: newValues };
      }

      // Comportement normal : toggle de la valeur
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      // Si on a désélectionné tout, mettre __NONE__
      if (newValues.length === 0) {
        return { ...prev, [field]: ['__NONE__'] };
      }

      return { ...prev, [field]: newValues };
    });
    setPage(0);
  };

  const handleSelectAllFilter = (field: keyof typeof filters) => {
    // Tout sélectionner = vider le filtre (comportement par défaut = tout afficher)
    setFilters((prev) => ({ ...prev, [field]: [] }));
    setPage(0);
  };

  const handleClearFilter = (field: keyof typeof filters) => {
    // Tout désélectionner = mettre un tableau avec une valeur impossible
    // pour ne rien afficher
    setFilters((prev) => ({ ...prev, [field]: ['__NONE__'] }));
    setPage(0);
  };

  // Obtenir toutes les valeurs uniques pour chaque colonne (memoized)
  const getUniqueValues = useCallback((field: keyof typeof filters): string[] => {
    const values = new Set<string>();
    pendingTiers.forEach((tier) => {
      let value = '';
      switch (field) {
        case 'raisonSociale':
          value = tier.raisonSociale || '';
          break;
        case 'siren':
          value = tier.siren || '';
          break;
        case 'source':
          value = tier.source;
          break;
        case 'submittedBy':
          value = tier.submittedBy || '';
          break;
      }
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  }, [pendingTiers]);

  const filteredTiers = useMemo(() => {
    return pendingTiers.filter((tier) => {
      // Vérifier si le filtre est dans l'état "rien sélectionné"
      const raisonSocialeFilterEmpty =
        filters.raisonSociale.length === 1 && filters.raisonSociale[0] === '__NONE__';
      const sirenFilterEmpty = filters.siren.length === 1 && filters.siren[0] === '__NONE__';
      const sourceFilterEmpty = filters.source.length === 1 && filters.source[0] === '__NONE__';
      const submittedByFilterEmpty =
        filters.submittedBy.length === 1 && filters.submittedBy[0] === '__NONE__';

      // Si un filtre est vide, ne rien afficher
      if (raisonSocialeFilterEmpty || sirenFilterEmpty || sourceFilterEmpty || submittedByFilterEmpty) {
        return false;
      }

      const matchesRaisonSociale =
        filters.raisonSociale.length === 0 ||
        filters.raisonSociale.includes(tier.raisonSociale || '');

      const matchesSiren =
        filters.siren.length === 0 || filters.siren.includes(tier.siren || '');

      const matchesSource = filters.source.length === 0 || filters.source.includes(tier.source);

      const matchesSubmittedBy =
        filters.submittedBy.length === 0 || filters.submittedBy.includes(tier.submittedBy || '');

      return matchesRaisonSociale && matchesSiren && matchesSource && matchesSubmittedBy;
    });
  }, [pendingTiers, filters]);

  const paginatedTiers = useMemo(() => {
    return filteredTiers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredTiers, page, rowsPerPage]);

  const getStatusChip = useCallback((status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.PENDING:
        return <Chip label="En attente" color="warning" size="small" />;
      case ApprovalStatus.APPROVED:
        return <Chip label="Approuvé" color="success" size="small" />;
      case ApprovalStatus.REJECTED:
        return <Chip label="Rejeté" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  }, []);

  const getSourceChip = useCallback((source: string) => {
    const sourceColors: Record<string, 'primary' | 'secondary' | 'default'> = {
      etl: 'primary',
      manual: 'secondary',
      api: 'default',
    };

    return <Chip label={source.toUpperCase()} color={sourceColors[source] || 'default'} size="small" />;
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Workflow d'Approbation des Tiers
        </Typography>
      </Box>

      {/* Statistiques */}
      <StatisticsCards
        pending={statistics.pending}
        approved={statistics.approved}
        rejected={statistics.rejected}
        total={statistics.total}
      />

      <Card>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`En attente (${statistics.pending})`} value={ApprovalStatus.PENDING} />
          <Tab label={`Approuvés (${statistics.approved})`} value={ApprovalStatus.APPROVED} />
          <Tab label={`Rejetés (${statistics.rejected})`} value={ApprovalStatus.REJECTED} />
        </Tabs>

        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      Raison sociale
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenFilter('raisonSociale', e)}
                        color={filters.raisonSociale.length > 0 ? 'primary' : 'default'}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      SIREN
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenFilter('siren', e)}
                        color={filters.siren.length > 0 ? 'primary' : 'default'}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      Source
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenFilter('source', e)}
                        color={filters.source.length > 0 ? 'primary' : 'default'}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      Soumis par
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenFilter('submittedBy', e)}
                        color={filters.submittedBy.length > 0 ? 'primary' : 'default'}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Doublons</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">
                        {pendingTiers.length === 0
                          ? `Aucun tiers ${currentTab === ApprovalStatus.PENDING ? 'en attente' : currentTab === ApprovalStatus.APPROVED ? 'approuvé' : 'rejeté'}`
                          : 'Aucun résultat ne correspond aux filtres'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTiers.map((tier) => (
                    <TableRow key={tier.uuid} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {tier.raisonSociale || '-'}
                        </Typography>
                        {tier.externalReference && (
                          <Typography variant="caption" color="text.secondary">
                            Réf: {tier.externalReference}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{tier.siren || '-'}</TableCell>
                      <TableCell>{getSourceChip(tier.source)}</TableCell>
                      <TableCell>{tier.submittedBy || '-'}</TableCell>
                      <TableCell>
                        {new Date(tier.dateCreation).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {tier.potentialDuplicates && tier.potentialDuplicates.length > 0 ? (
                          <Chip
                            icon={<WarningIcon />}
                            label={`${tier.potentialDuplicates.length}`}
                            color="warning"
                            size="small"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{getStatusChip(tier.status)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDetailDialog(tier)} title="Détails">
                          <ViewIcon />
                        </IconButton>
                        {tier.status === ApprovalStatus.PENDING && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenApproveDialog(tier)}
                              color="success"
                              title="Approuver"
                            >
                              <ApproveIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenRejectDialog(tier)}
                              color="error"
                              title="Rejeter"
                            >
                              <RejectIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(tier)}
                          color="error"
                          title="Supprimer"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredTiers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog Détails */}
      <TierDetailDialog
        open={detailDialogOpen}
        tier={selectedTier}
        onClose={handleCloseDetailDialog}
      />

      {/* Dialog Approbation - Version améliorée avec édition */}
      <ApprovalDialog
        open={approveDialogOpen}
        tier={selectedTier}
        currentUser={currentUser}
        editableTierData={editableTierData}
        customAttributes={customAttributes}
        globalAttributeValues={globalAttributeValues}
        onEditableTierDataChange={setEditableTierData}
        onGlobalAttributeValuesChange={setGlobalAttributeValues}
        onClose={handleCloseApproveDialog}
        onApprove={handleApprove}
      />

      {/* Dialog Rejet */}
      <RejectDialog
        open={rejectDialogOpen}
        tier={selectedTier}
        currentUser={currentUser}
        reviewComment={reviewComment}
        onCommentChange={setReviewComment}
        onClose={handleCloseRejectDialog}
        onReject={handleReject}
      />

      {/* Dialog Suppression */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce tiers en attente"
        message="Cette action est irréversible. Pour confirmer la suppression, veuillez saisir"
        itemName={
          selectedTier
            ? `${selectedTier.raisonSociale || '-'} (${selectedTier.siren || 'N/A'})`
            : ''
        }
        confirmationText="supprimer"
      />

      {/* Filtres - Colonnes */}
      {(['raisonSociale', 'siren', 'source', 'submittedBy'] as const).map((field) => (
        <ColumnFilterMenu
          key={field}
          field={field}
          anchorEl={filterAnchors[field]}
          onClose={() => handleCloseFilter(field)}
          uniqueValues={getUniqueValues(field)}
          selectedValues={filters[field]}
          onToggleValue={(value) => handleToggleFilterValue(field, value)}
          onSelectAll={() => handleSelectAllFilter(field)}
          onClearAll={() => handleClearFilter(field)}
        />
      ))}
    </Box>
  );
}
