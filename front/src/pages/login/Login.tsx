import { Button, CircularProgress, Container, Typography, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import AuthApi from '../../services/AuthApi'
import { DefaultContainer, StyledPaper, LogoContainer } from './LoginStyled';
import { useAuth } from '../../providers/AuthProvider';

export default function Login() {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/home', { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  function onClickLogin() {
    setLoading(true);
    AuthApi.login();
  }

  if (isAuthLoading) {
    return (
      <DefaultContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DefaultContainer>
    );
  }

  return (
    <DefaultContainer>
      <Container maxWidth="sm">
        <StyledPaper elevation={10}>
          <LogoContainer>
            <img
              src="/logo_blanc_advitam.png"
              alt="Logo Advitam"
            />
          </LogoContainer>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              Bienvenue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous pour accéder à l'application
            </Typography>
          </Box>

          {isLoading ? (
            <CircularProgress sx={{ mt: 2 }} size={40} />
          ) : (
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(63, 108, 81, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(63, 108, 81, 0.4)',
                }
              }}
              onClick={onClickLogin}
            >
              Se connecter avec Azure AD
            </Button>
          )}
        </StyledPaper>
      </Container>
    </DefaultContainer>
  );
}
