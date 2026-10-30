import { createContext, useState, ReactNode, useEffect, useCallback, useContext } from 'react';
import { Snackbar, Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material';
import { v4 as uuidv4 } from "uuid";
import { setSnackbarContext } from '../config/axios';

type Severity = 'error' | 'info' | 'success' | 'warning';

interface SnackbarMessage {
  id: string;
  message: string;
  severity: Severity;
  details?: string[];
}

export interface SnackbarContextType {
  showSnackbarMessage: (message: string, severity?: Severity, details?: string[]) => void;
  showSuccessMessage: () => void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<SnackbarMessage[]>([]); // File d'attente des Snackbars
  const [currentSnackbar, setCurrentSnackbar] =
    useState<SnackbarMessage | null>(null); // Snackbar en cours

  const showSnackbarMessage = useCallback((
    message: string,
    severity: Severity = 'info',
    details?: string[],
  ) => {
    const snack: SnackbarMessage = {
      message,
      severity,
      details,
      id: uuidv4(),
    };
    setQueue((prev) => [...prev, snack]);
  }, []);

  const showSuccessMessage = useCallback(() => {
    const snack: SnackbarMessage = {
      message: "L'opération a été réalisée avec succès.",
      severity: 'success',
      id: uuidv4(),
    };
    setQueue((prev) => [...prev, snack]);
  }, []);

  const handleClose = useCallback(() => {
    if (!currentSnackbar) {
      return;
    }
    setQueue((prev) => prev.filter((s) => s.id !== currentSnackbar.id));
    setCurrentSnackbar(null);
  }, [currentSnackbar]);

  useEffect(() => {
    if (currentSnackbar === null && queue.length > 0) {
      setCurrentSnackbar(queue[0]);
    }
  }, [currentSnackbar, queue]);

  // Exposer le contexte à Axios
  useEffect(() => {
    setSnackbarContext({ showSnackbarMessage });
  }, []);

  return (
    <SnackbarContext.Provider
      value={{ showSnackbarMessage, showSuccessMessage }}
    >
      {children}
      {currentSnackbar && (
        <Snackbar
          open={Boolean(currentSnackbar)}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleClose}
            severity={currentSnackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              maxWidth: 500,
              color: currentSnackbar.severity === 'success' ? '#fff' : undefined,
              '& .MuiAlert-icon': {
                color: currentSnackbar.severity === 'success' ? '#fff' : undefined,
              },
            }}
          >
            {currentSnackbar.details && Array.isArray(currentSnackbar.details) && currentSnackbar.details.length > 0 ? (
              <>
                <AlertTitle sx={{ color: 'inherit' }}>{currentSnackbar.message}</AlertTitle>
                <List dense sx={{ py: 0 }}>
                  {currentSnackbar.details.map((detail, index) => (
                    <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                      <ListItemText
                        primary={`• ${detail}`}
                        slotProps={{
                          primary: {
                            variant: 'body2',
                            sx: { color: 'inherit' }
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              currentSnackbar.message
            )}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};
