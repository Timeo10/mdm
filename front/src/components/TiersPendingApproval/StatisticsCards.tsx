import { Grid, Paper, Typography } from '@mui/material';

interface StatisticsCardsProps {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function StatisticsCards({ pending, approved, rejected, total }: StatisticsCardsProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main" fontWeight={600}>
            {pending}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            En attente
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" fontWeight={600}>
            {approved}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approuvés
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="error.main" fontWeight={600}>
            {rejected}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rejetés
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary.main" fontWeight={600}>
            {total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
