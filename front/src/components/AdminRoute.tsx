import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { Box, Alert, AlertTitle, Button } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const permissions = usePermissions();
  const navigate = useNavigate();

  if (!permissions.isAdmin()) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        p={3}
      >
        <Alert
          severity="error"
          icon={<LockIcon fontSize="large" />}
          sx={{ maxWidth: 600 }}
        >
          <AlertTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Accès refusé
          </AlertTitle>
          Vous devez être administrateur pour accéder à cette page.
          <Box mt={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/home')}
            >
              Retour à l'accueil
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}
