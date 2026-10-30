import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { TiersApi } from '../../services/TiersApi';
import { SocieteApi } from '../../services/SocieteApi';
import { TierPendingApprovalApi } from '../../services/TierPendingApprovalApi';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTiers: 0,
    totalSocietes: 0,
    pendingApproval: 0,
    approved: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [tiersResponse, societesResponse, approvalStats] = await Promise.all([
        TiersApi.getAll({ limit: 1, includeInactive: true }),
        SocieteApi.getAll(),
        TierPendingApprovalApi.getStatistics(),
      ]);

      setStats({
        totalTiers: tiersResponse.total,
        totalSocietes: societesResponse.length,
        pendingApproval: approvalStats.pending,
        approved: approvalStats.approved,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box p={3}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Tableau de bord
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Bienvenue dans le MDM - Gestion du référentiel des tiers
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Tiers"
              value={stats.totalTiers}
              icon={<PeopleIcon />}
              color="#1976d2"
              subtitle="Total des tiers"
              loading={loading}
              onClick={() => navigate('/tiers')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Sociétés"
              value={stats.totalSocietes}
              icon={<BusinessIcon />}
              color="#2e7d32"
              subtitle="Total des sociétés"
              loading={loading}
              onClick={() => navigate('/societes')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="En attente"
              value={stats.pendingApproval}
              icon={<HourglassEmptyIcon />}
              color="#ed6c02"
              subtitle="En attente d'approbation"
              loading={loading}
              onClick={() => navigate('/tiers-pending-approval')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Approuvés"
              value={stats.approved}
              icon={<CheckCircleIcon />}
              color="#388e3c"
              subtitle="Tiers approuvés"
              loading={loading}
              onClick={() => navigate('/tiers-pending-approval')}
            />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
