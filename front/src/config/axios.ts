import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let snackbarContext: {
  showSnackbarMessage: (message: string, severity: 'error' | 'info' | 'success' | 'warning', details?: string[]) => void
} | null = null;

export const setSnackbarContext = (context: typeof snackbarContext) => {
  snackbarContext = context;
};

interface ApiErrorResponse {
  message: string;
  details?: string[];
}

// Variables pour gérer les tentatives de reconnexion
let isRefreshing = false;
let isManualLogout = false; // Flag pour détecter une déconnexion volontaire
let hasBeenAuthenticated = false; // Flag pour savoir si l'utilisateur a déjà été connecté
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

const attemptReconnection = async (): Promise<boolean> => {
  try {
    // Utiliser axios brut (pas axiosInstance) pour éviter l'intercepteur
    // et marquer la requête pour éviter la boucle
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      hasBeenAuthenticated = true;
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Fonction pour marquer qu'une déconnexion manuelle est en cours
export const setManualLogout = (value: boolean) => {
  isManualLogout = value;

  // Réinitialiser automatiquement après 5 secondes pour éviter de bloquer les reconnexions futures
  if (value) {
    setTimeout(() => {
      isManualLogout = false;
    }, 5000);
  }
};

// Fonction pour marquer qu'un utilisateur a été authentifié avec succès
export const setAuthenticated = (value: boolean) => {
  hasBeenAuthenticated = value;
};

// Intercepteur de réponse pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const silentErrors = Boolean(originalRequest?.silentErrors);
    let errorMessage = 'Une erreur est survenue';
    let errorDetails: string[] | undefined;

    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const status = error.response.status;
      const data = error.response.data as ApiErrorResponse | undefined;

      // Gérer l'erreur 401 - Session expirée ou utilisateur non connecté
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Si c'est une déconnexion volontaire, ne pas tenter de reconnecter
        if (isManualLogout) {
          // Ne pas afficher de message d'erreur pour un logout volontaire
          // Le flag sera réinitialisé après la redirection
          return Promise.reject(error);
        }

        // Si l'utilisateur n'a jamais été connecté, ne pas afficher de message
        if (!hasBeenAuthenticated) {
          return Promise.reject(error);
        }

        // Si une reconnexion est déjà en cours, mettre en file d'attente
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        // Afficher le message de tentative de reconnexion
        if (snackbarContext) {
          snackbarContext.showSnackbarMessage('Session expirée. Tentative de reconnexion...', 'warning');
        }

        // Tenter de se reconnecter
        try {
          const reconnected = await attemptReconnection();

          if (reconnected) {
            // Reconnexion réussie
            isRefreshing = false;
            processQueue(null);

            if (snackbarContext) {
              snackbarContext.showSnackbarMessage('Reconnexion réussie', 'success');
            }

            // Réessayer la requête originale
            return axiosInstance(originalRequest);
          } else {
            // Reconnexion échouée, rediriger vers la page de login
            isRefreshing = false;
            processQueue(error);

            if (snackbarContext) {
              snackbarContext.showSnackbarMessage('Reconnexion impossible. Redirection vers la page de connexion...', 'error');
            }

            setTimeout(() => {
              window.location.href = '/';
            }, 1500);

            return Promise.reject(error);
          }
        } catch (reconnectError) {
          isRefreshing = false;
          processQueue(error);

          if (snackbarContext) {
            snackbarContext.showSnackbarMessage('Reconnexion impossible. Redirection vers la page de connexion...', 'error');
          }

          setTimeout(() => {
            window.location.href = '/';
          }, 1500);

          return Promise.reject(error);
        }
      }

      // Extraire le message et les détails de l'API
      if (data?.message) {
        errorMessage = data.message;
        errorDetails = data.details;
      } else {
        // Messages par défaut par code HTTP
        switch (status) {
          case 400:
            errorMessage = 'Requête invalide';
            break;
          case 403:
            errorMessage = 'Accès interdit';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 409:
            errorMessage = 'Conflit de données';
            break;
          case 422:
            errorMessage = 'Données de validation invalides';
            break;
          case 500:
            errorMessage = 'Erreur interne du serveur';
            break;
          case 502:
            errorMessage = 'Serveur indisponible';
            break;
          case 503:
            errorMessage = 'Service temporairement indisponible';
            break;
          default:
            errorMessage = `Erreur ${status}`;
        }
      }
    } else if (error.request) {
      // La requête a été envoyée mais aucune réponse n'a été reçue
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      errorMessage = error.message || 'Erreur lors de la requête';
    }

    // Afficher l'erreur via la snackbar avec les détails
    if (snackbarContext && !silentErrors) {
      snackbarContext.showSnackbarMessage(errorMessage, 'error', errorDetails);
    }

    return Promise.reject(error);
  }
);

// Intercepteur de requête (optionnel, pour ajouter des tokens d'authentification par exemple)
axiosInstance.interceptors.request.use(
  (config) => {
    // Vous pouvez ajouter un token d'authentification ici
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
