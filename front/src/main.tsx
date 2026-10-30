import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import theme from './theme'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from './providers/SnackBarProvider.tsx'
import { AuthProvider } from './providers/AuthProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <AuthProvider>
          {/* <BrowserRouter> */}
            <App />
          {/* </BrowserRouter> */}
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
