import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const DefaultContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
  },
}));

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  maxWidth: '400px',
  width: '100%',
}));

export const LogoContainer = styled(Box)(({ theme }) => ({
  width: '220px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  '& img': {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
}));
