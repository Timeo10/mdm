import { Box, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography variant="h4" fontWeight={600}>
        404
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Page non trouvée
      </Typography>
    </Box>
  );
}
