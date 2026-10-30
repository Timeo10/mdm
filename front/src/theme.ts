import { createTheme } from '@mui/material/styles';

// Charte graphique Pôle Groupe
const brandColors = {
  poleGroupe: '#3F6C51',      // Couleur principale - Pôle Groupe
  poleAgricole: '#B04E31',     // Pôle Agricole
  poleDistribution: '#76AE62', // Pôle Distribution
  jaune: '#FAC844',            // Jaune
  corail: '#ED6E4C',           // Corail
  dore: '#C8A532',             // Doré
  bleu: '#5CBDB9',             // Bleu
  mauve: '#A66784',            // Mauve
};

// Création du thème Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: brandColors.poleGroupe,
      light: '#5a8670',
      dark: '#2c4e3a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.dore,
      light: '#d9ba5a',
      dark: '#9e8325',
      contrastText: '#000000',
    },
    success: {
      main: brandColors.poleDistribution,
      light: '#92c07e',
      dark: '#5a8a4b',
      contrastText: '#ffffff',
    },
    error: {
      main: brandColors.poleAgricole,
      light: '#c67359',
      dark: '#8a3722',
      contrastText: '#ffffff',
    },
    warning: {
      main: brandColors.corail,
      light: '#f18e6d',
      dark: '#d94f2f',
      contrastText: '#ffffff',
    },
    info: {
      main: brandColors.bleu,
      light: '#7dcac7',
      dark: '#459f9b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
      color: brandColors.poleGroupe,
    },
    h2: {
      fontWeight: 600,
      color: brandColors.poleGroupe,
    },
    h3: {
      fontWeight: 600,
      color: brandColors.poleGroupe,
    },
    h4: {
      fontWeight: 600,
      color: brandColors.corail ,
    },
    h5: {
      fontWeight: 600,
      color: brandColors.poleGroupe,
    },
    h6: {
      fontWeight: 600,
      color: brandColors.poleGroupe,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(63, 108, 81, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
export { brandColors };
