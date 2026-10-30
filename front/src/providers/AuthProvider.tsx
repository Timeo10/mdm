import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import AuthApi, { User } from '../services/AuthApi';
import { setManualLogout, setAuthenticated } from '../config/axios';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await AuthApi.getMe();
      setUser(response.user);
      // Marquer l'utilisateur comme authentifié avec succès
      setAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Marquer qu'il s'agit d'une déconnexion volontaire AVANT tout appel
    setManualLogout(true);
    // Réinitialiser le flag d'authentification
    setAuthenticated(false);

    try {
      await AuthApi.logout();
    } catch (error) {
      console.error('Failed to logout:', error);
      // Continuer même en cas d'erreur (déconnexion locale)
    } finally {
      // Déconnexion locale dans tous les cas
      setUser(null);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
